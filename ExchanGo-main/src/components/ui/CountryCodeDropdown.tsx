import React, { useState, useRef, useEffect } from "react";

export interface CountryCode {
  code: string;
  flag: string;
  country: string;
}

interface CountryCodeDropdownProps {
  countryCodes?: CountryCode[];
  defaultValue?: string | null;
  onChange?: (value: CountryCode | null) => void;
  disabled?: boolean;
}

const defaultCountryCodes: CountryCode[] = [
  { code: "+1", flag: "us", country: "USA" },
  { code: "+7", flag: "ru", country: "Russia" },
  { code: "+20", flag: "eg", country: "Egypt" },
  { code: "+27", flag: "za", country: "South Africa" },
  { code: "+30", flag: "gr", country: "Greece" },
  { code: "+31", flag: "nl", country: "Netherlands" },
  { code: "+32", flag: "be", country: "Belgium" },
  { code: "+33", flag: "fr", country: "France" },
  { code: "+34", flag: "es", country: "Spain" },
  { code: "+36", flag: "hu", country: "Hungary" },
  { code: "+39", flag: "it", country: "Italy" },
  { code: "+40", flag: "ro", country: "Romania" },
  { code: "+41", flag: "ch", country: "Switzerland" },
  { code: "+43", flag: "at", country: "Austria" },
  { code: "+44", flag: "gb", country: "UK" },
  { code: "+45", flag: "dk", country: "Denmark" },
  { code: "+46", flag: "se", country: "Sweden" },
  { code: "+47", flag: "no", country: "Norway" },
  { code: "+48", flag: "pl", country: "Poland" },
  { code: "+49", flag: "de", country: "Germany" },
  { code: "+51", flag: "pe", country: "Peru" },
  { code: "+52", flag: "mx", country: "Mexico" },
  { code: "+54", flag: "ar", country: "Argentina" },
  { code: "+55", flag: "br", country: "Brazil" },
  { code: "+56", flag: "cl", country: "Chile" },
  { code: "+57", flag: "co", country: "Colombia" },
  { code: "+58", flag: "ve", country: "Venezuela" },
  { code: "+60", flag: "my", country: "Malaysia" },
  { code: "+61", flag: "au", country: "Australia" },
  { code: "+62", flag: "id", country: "Indonesia" },
  { code: "+63", flag: "ph", country: "Philippines" },
  { code: "+64", flag: "nz", country: "New Zealand" },
  { code: "+65", flag: "sg", country: "Singapore" },
  { code: "+66", flag: "th", country: "Thailand" },
  { code: "+81", flag: "jp", country: "Japan" },
  { code: "+82", flag: "kr", country: "South Korea" },
  { code: "+84", flag: "vn", country: "Vietnam" },
  { code: "+86", flag: "cn", country: "China" },
  { code: "+90", flag: "tr", country: "Turkey" },
  { code: "+91", flag: "in", country: "India" },
  { code: "+92", flag: "pk", country: "Pakistan" },
  { code: "+93", flag: "af", country: "Afghanistan" },
  { code: "+94", flag: "lk", country: "Sri Lanka" },
  { code: "+95", flag: "mm", country: "Myanmar" },
  { code: "+98", flag: "ir", country: "Iran" },
  { code: "+212", flag: "ma", country: "Morocco" },
  { code: "+213", flag: "dz", country: "Algeria" },
  { code: "+216", flag: "tn", country: "Tunisia" },
  { code: "+218", flag: "ly", country: "Libya" },
  { code: "+220", flag: "gm", country: "Gambia" },
  { code: "+221", flag: "sn", country: "Senegal" },
  { code: "+222", flag: "mr", country: "Mauritania" },
  { code: "+223", flag: "ml", country: "Mali" },
  { code: "+234", flag: "ng", country: "Nigeria" },
  { code: "+249", flag: "sd", country: "Sudan" },
  { code: "+250", flag: "rw", country: "Rwanda" },
  { code: "+251", flag: "et", country: "Ethiopia" },
  { code: "+254", flag: "ke", country: "Kenya" },
  { code: "+255", flag: "tz", country: "Tanzania" },
  { code: "+256", flag: "ug", country: "Uganda" },
  { code: "+260", flag: "zm", country: "Zambia" },
  { code: "+263", flag: "zw", country: "Zimbabwe" },
  { code: "+351", flag: "pt", country: "Portugal" },
  { code: "+352", flag: "lu", country: "Luxembourg" },
  { code: "+353", flag: "ie", country: "Ireland" },
  { code: "+354", flag: "is", country: "Iceland" },
  { code: "+355", flag: "al", country: "Albania" },
  { code: "+358", flag: "fi", country: "Finland" },
  { code: "+359", flag: "bg", country: "Bulgaria" },
  { code: "+370", flag: "lt", country: "Lithuania" },
  { code: "+371", flag: "lv", country: "Latvia" },
  { code: "+372", flag: "ee", country: "Estonia" },
  { code: "+380", flag: "ua", country: "Ukraine" },
  { code: "+381", flag: "rs", country: "Serbia" },
  { code: "+385", flag: "hr", country: "Croatia" },
  { code: "+386", flag: "si", country: "Slovenia" },
  { code: "+420", flag: "cz", country: "Czech Republic" },
  { code: "+421", flag: "sk", country: "Slovakia" },
  { code: "+886", flag: "tw", country: "Taiwan" },
  { code: "+961", flag: "lb", country: "Lebanon" },
  { code: "+962", flag: "jo", country: "Jordan" },
  { code: "+963", flag: "sy", country: "Syria" },
  { code: "+964", flag: "iq", country: "Iraq" },
  { code: "+965", flag: "kw", country: "Kuwait" },
  { code: "+966", flag: "sa", country: "Saudi Arabia" },
  { code: "+967", flag: "ye", country: "Yemen" },
  { code: "+968", flag: "om", country: "Oman" },
  { code: "+971", flag: "ae", country: "UAE" },
  { code: "+972", flag: "il", country: "Israel" },
  { code: "+973", flag: "bh", country: "Bahrain" },
  { code: "+974", flag: "qa", country: "Qatar" },
  { code: "+975", flag: "bt", country: "Bhutan" },
  { code: "+976", flag: "mn", country: "Mongolia" },
  { code: "+977", flag: "np", country: "Nepal" },
  { code: "+992", flag: "tj", country: "Tajikistan" },
  { code: "+993", flag: "tm", country: "Turkmenistan" },
  { code: "+994", flag: "az", country: "Azerbaijan" },
  { code: "+995", flag: "ge", country: "Georgia" },
  { code: "+998", flag: "uz", country: "Uzbekistan" },
];

const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = ({
  countryCodes = defaultCountryCodes,
  defaultValue = "+212",
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CountryCode | null>(
    countryCodes.find((c) => c.code === defaultValue) ?? null
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleDropdown() {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }

  function handleSelect(code: CountryCode) {
    if (!disabled) {
      setSelectedCode(code);
      setIsOpen(false);
      if (onChange) {
        onChange(code);
      }
    }
  }

  return (
    <div className="relative select-none" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full cursor-pointer flex items-center justify-between gap-1.5 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedCode && (
            <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={`https://flagcdn.com/w20/${selectedCode.flag}.png`}
                alt={selectedCode.country}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          <span className="text-[#292D32] text-sm leading-[20px] font-normal">
            {selectedCode?.code || ""}
          </span>
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            d="M16.5984 7.45825L11.1651 12.8916C10.5234 13.5333 9.47344 13.5333 8.83177 12.8916L3.39844 7.45825"
            stroke="#292D32"
            strokeWidth={1.52072}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <ul
          tabIndex={-1}
          role="listbox"
          aria-activedescendant={
            selectedCode ? `country-option-${selectedCode.code}` : undefined
          }
          className="absolute z-30 w-full mt-2 -ml-3 max-h-60 bg-white border rounded border-black/20 overflow-auto hide-scrollbar px-2 min-w-[100px]"
        >
          {countryCodes.map((country) => (
            <li
              id={`country-option-${country.code}`}
              key={country.code}
              role="option"
              aria-selected={selectedCode?.code === country.code}
              tabIndex={0}
              onClick={() => handleSelect(country)}
              className="cursor-pointer flex items-center font-medium text-[#585858] text-sm px-2 py-1.5 gap-2"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={`https://flagcdn.com/w20/${country.flag}.png`}
                  alt={country.country}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span>{country.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountryCodeDropdown;
