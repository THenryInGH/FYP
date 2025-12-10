type Props = {
  disabled?: boolean;
};

function SubmitIntentButton({ disabled }: Props) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Submit
    </button>
  );
}

export default SubmitIntentButton;