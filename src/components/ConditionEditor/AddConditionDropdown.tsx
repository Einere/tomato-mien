import { Button, Dropdown } from "../UI";

type AddConditionDropdownProps = {
  addCondition: () => void;
  addGroup: () => void;
}

export function AddConditionDropdown({ addCondition, addGroup }: AddConditionDropdownProps) {

  return (
    <Dropdown
      trigger={
        <Button
          variant="secondary"
          className="w-full border-2 border-dashed border-gray-300 text-secondary hover:border-gray-400 hover:text-gray-600"
        >
          + 조건 추가
        </Button>
      }
      items={[
        {
          label: '조건 추가',
          onClick: addCondition
        },
        {
          label: '그룹 추가',
          onClick: addGroup
        }
      ]}
    />
  );
}