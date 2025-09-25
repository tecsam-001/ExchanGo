import React, { useState, useEffect } from "react";
import PlusIcon from "../SvgIcons/PlusIcon";
import ToggleButton from "../ui/ToggleButton";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import { toast } from "react-toastify";
import { getMyFaqs, createFaq, updateFaq, deleteFaq, FAQ, createFaqsBulk } from "@/services/api";
import Loader from "../ui/Loader";

interface FAQItem extends FAQ {
  isLocked: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
}

const AddFaqButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <>
    <button
      onClick={onClick}
      className="border border-[#20523C] rounded-md h-[46px] w-[169px] text-[#20523C] text-[16px] font-medium leading-[22px] hidden sm:flex items-center gap-1 justify-center cursor-pointer"
    >
      <PlusIcon /> Add New Faq
    </button>
    <button
      onClick={onClick}
      className="text-nowrap text-[#20523C] text-[14px] font-medium leading-[17px] sm:hidden flex items-center gap-0.5 justify-center cursor-pointer"
    >
      <PlusIcon /> Add New
    </button>
  </>
);

const DeleteFaqButton: React.FC<{ onClick: () => void; isDeleting?: boolean }> = ({ onClick, isDeleting }) => (
  <button onClick={onClick} className={`cursor-pointer ${isDeleting ? 'opacity-50' : ''}`} disabled={isDeleting}>
    {isDeleting ? (
      <div className="w-5 h-5 border-2 border-[#D03739] border-t-transparent rounded-full animate-spin"></div>
    ) : (
      <DeleteIcon />
    )}
  </button>
);

const FaqToggleButton: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
  <ToggleButton defaultChecked={checked} size="md" onChange={onChange} />
);

const SaveFaqsButton: React.FC<{ onClick: () => void; disabled: boolean; isSaving: boolean }> = ({
  onClick,
  disabled,
  isSaving,
}) => (
  <button
    onClick={onClick}
    disabled={disabled || isSaving}
    className={`w-full sm:w-[145px] h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px] ${
      disabled || isSaving ? "opacity-50 cursor-not-allowed" : ""
    }`}
    style={{
      background:
        "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow:
        "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
    }}
  >
    {isSaving ? (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin mr-2"></div>
        <span>Saving...</span>
      </div>
    ) : (
      "Save Update"
    )}
  </button>
);

const SupportDocumentation = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [originalFaqs, setOriginalFaqs] = useState<FAQItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch FAQs from API on component mount
  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getMyFaqs();
        
        if (response.success && response.data) {
          const formattedFaqs = response.data.map(faq => ({
            ...faq,
            isLocked: true
          }));
          setFaqs(formattedFaqs);
          setOriginalFaqs(JSON.parse(JSON.stringify(formattedFaqs))); // Deep copy
        } else {
          setError(response.message || "Failed to load FAQs");
          toast.error(response.message || "Failed to load FAQs");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Check for changes whenever faqs state changes
  useEffect(() => {
    if (originalFaqs.length > 0) {
      // Check if the arrays have different lengths
      if (originalFaqs.length !== faqs.length) {
        setHasChanges(true);
        return;
      }

      // Compare each FAQ item
      const hasAnyChanges = faqs.some((faq) => {
        // Check for new FAQs
        if (faq.isNew) return true;
        
        // Find matching FAQ by ID
        const originalFaq = originalFaqs.find((o) => o.id === faq.id);
        if (!originalFaq) return true; // New FAQ added

        // Check if any properties are different
        return (
          originalFaq.question !== faq.question ||
          originalFaq.answer !== faq.answer ||
          originalFaq.isLocked !== faq.isLocked
        );
      });

      setHasChanges(hasAnyChanges);
    }
  }, [faqs, originalFaqs]);

  const handleToggle = (id: string, checked: boolean) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === id ? { ...faq, isLocked: checked } : faq))
    );
  };

  const handleInputChange = (
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq))
    );
    
    // Set hasChanges directly when input changes
    setHasChanges(true);
    console.log("Input changed, hasChanges set to true");
  };

  const handleAddFaq = () => {
    const tempId = `temp_${Date.now()}`;
    const newFaq: FAQItem = {
      id: tempId,
      question: "",
      answer: "",
      isLocked: false,
      isNew: true
    };
    setFaqs((prev) => [...prev, newFaq]);
    // Explicitly set hasChanges to true when adding a new FAQ
    setHasChanges(true);
  };

  const handleDeleteFaq = async (id: string) => {
    // If it's a new FAQ that hasn't been saved to the server yet
    if (id.startsWith('temp_')) {
      setFaqs((prev) => prev.filter((faq) => faq.id !== id));
      return;
    }
    
    // Mark as deleting
    setFaqs((prev) => 
      prev.map((faq) => faq.id === id ? { ...faq, isDeleting: true } : faq)
    );
    
    try {
      const response = await deleteFaq(id);
      
      if (response.success) {
        setFaqs((prev) => prev.filter((faq) => faq.id !== id));
        toast.success("FAQ deleted successfully");
        // Update originalFaqs to reflect the deletion
        setOriginalFaqs((prev) => prev.filter((faq) => faq.id !== id));
      } else {
        toast.error(response.message || "Failed to delete FAQ");
        // Remove the deleting state
        setFaqs((prev) => 
          prev.map((faq) => faq.id === id ? { ...faq, isDeleting: false } : faq)
        );
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("An unexpected error occurred. Please try again.");
      // Remove the deleting state
      setFaqs((prev) => 
        prev.map((faq) => faq.id === id ? { ...faq, isDeleting: false } : faq)
      );
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Only send new FAQs (no id or isNew: true)
      const newFaqs = faqs.filter(faq => (!faq.id || faq.isNew) && (faq.question.trim() !== "" || faq.answer.trim() !== ""));
      if (newFaqs.length === 0) {
        toast.info("No new FAQs to save");
        setIsSaving(false);
        return;
      }
      const bulkBody = {
        faqs: newFaqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))
      };
      const response = await createFaqsBulk(bulkBody);
      console.log("Bulk FAQ API response:", response);
      if (response && response.success && Array.isArray(response.data)) {
        // Merge new FAQs with existing ones
        const existingFaqs = faqs.filter(faq => faq.id && !faq.isNew);
        const allFaqs = [
          ...existingFaqs,
          ...response.data.map((faq: any) => ({ ...faq, isLocked: true }))
        ];
        setFaqs(allFaqs);
        setOriginalFaqs(JSON.parse(JSON.stringify(allFaqs)));
        setHasChanges(false);
        toast.success(`Saved ${response.data.length} new FAQ(s) successfully`);
      } else {
        toast.error((response && response.message) || "Failed to save FAQs");
      }
    } catch (error) {
      console.error("Error saving FAQs:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader isLoading={true} />
      </div>
    );
  }

  if (error && faqs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[#20523C] text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }


  return (
    <>
      <div className="flex items-start gap-6 justify-between w-full">
        <div className="w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            <h2 className="text-[16px] font-semibold leading-[24px]">FAQ</h2>
            <div className="sm:hidden block">
              <AddFaqButton onClick={handleAddFaq} />
            </div>
          </div>
          <p className="text-[#424242] text-[14px] leading-[21px] font-normal sm:max-w-[295px] mt-1.5 sm:mt-1">
            Manage your office's frequently asked questions.
          </p>
        </div>
        <div className="sm:block hidden">
          <AddFaqButton onClick={handleAddFaq} />
        </div>
      </div>

      {faqs.length === 0 && !isLoading && (
        <div className="text-center py-8 mt-4">
          <p className="text-gray-500 mb-4">No FAQs found. Add your first FAQ.</p>
        </div>
      )}

      {faqs.map((faq, index) => (
        <div
          key={faq.id}
          className="max-w-[679px] flex sm:flex-row flex-col items-start gap-6 mt-4 sm:mt-6"
        >
          <div className="w-full sm:hidden flex items-center justify-between gap-4">
            <h2 className="text-[14px] font-semibold leading-[18px]">
              Question {index + 1}
            </h2>
            <div className="flex items-center gap-3">
              <DeleteFaqButton 
                onClick={() => handleDeleteFaq(faq.id)} 
                isDeleting={faq.isDeleting}
              />
              <FaqToggleButton
                checked={faq.isLocked}
                onChange={(checked) => handleToggle(faq.id, checked)}
              />
            </div>
          </div>
          <div className="max-w-[580px] w-full">
            <div className="w-full relative bg-white border border-[#DEDEDE] rounded-lg px-4 h-[56px]">
              <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111] flex items-center gap-1">
                Question <span className="sm:block hidden">{index + 1}</span>
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Enter question here"
                  value={faq.question}
                  readOnly={faq.isLocked}
                  onChange={(e) =>
                    handleInputChange(faq.id, "question", e.target.value)
                  }
                  className="flex-1 bg-transparent py-[18px] border-0 outline-none smaller text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal"
                />
              </div>
            </div>

            <div className="mt-4 w-full relative bg-white border border-[#DEDEDE] rounded-lg">
              <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                Answer
              </label>
              <div className="flex items-center">
                {faq.isLocked ? (
                  <h3 className="py-[14px] sm:py-[18px] px-4 text-[14px] leading-[20px] font-normal text-[#111111]">
                    {faq.answer || "No answer provided."}
                  </h3>
                ) : (
                  <textarea
                    placeholder="Enter answer here"
                    value={faq.answer}
                    readOnly={faq.isLocked}
                    onChange={(e) =>
                      handleInputChange(faq.id, "answer", e.target.value)
                    }
                    className="px-4 flex-1 max-h-fit bg-transparent py-[14px] sm:py-[18px] min-h-[96px] border-0 outline-none text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 hidden sm:flex items-center gap-4">
            <FaqToggleButton
              checked={faq.isLocked}
              onChange={(checked) => handleToggle(faq.id, checked)}
            />
            <DeleteFaqButton 
              onClick={() => handleDeleteFaq(faq.id)} 
              isDeleting={faq.isDeleting}
            />
          </div>
        </div>
      ))}

      <div className="bg-[#DEDEDE] w-full h-[1px] mt-8 sm:block hidden"></div>

      <div className="flex items-end justify-end w-full mt-10 sm:mt-4 pb-10">
        <SaveFaqsButton
          onClick={handleSaveAll}
          disabled={false} /* Force enable the button */
          isSaving={isSaving}
        />
      </div>
    </>
  );
};

export default SupportDocumentation;
