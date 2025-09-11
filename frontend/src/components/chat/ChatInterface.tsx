import IntentInput from './IntentInput';
import IntentOutput from './IntentOutput';
import SubmitIntentButton from './SubmitIntentButton';

function ChatInterface() {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 rounded-lg w-96">
      <h2 className="font-semibold mb-2">Chat Interface</h2>
      <IntentOutput />
      <IntentInput />
      <SubmitIntentButton />
    </div>
  );
}

export default ChatInterface;
