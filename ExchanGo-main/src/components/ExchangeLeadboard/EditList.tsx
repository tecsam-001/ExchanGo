import React from 'react';

interface EditListProps {
  onEdit: () => void;
}

const EditList: React.FC<EditListProps> = ({ onEdit }) => (
  <button
    onClick={onEdit}
    className='cursor-pointer border border-[#20523C] rounded-md h-[40px] md:h-[46px] px-6 text-[#20523C] text-[16px] font-medium leading-[22px] hover:bg-[#20523C] hover:text-white transition-all duration-200'
  >
    Edit list
  </button>
);

export default EditList;