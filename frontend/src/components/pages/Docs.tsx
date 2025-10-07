function Docs() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Documentation</h1>
      <p className="mb-2">
        Welcome to the FYP (For Your Ping) documentation page. Here you will find all the information you need to get started with our application.
      </p>
      <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
      <p className="mb-2">
        To get started, simply log in using your credentials. If you don't have an account, please contact your administrator to set one up for you.
      </p>
      <h2 className="text-xl font-semibold mb-2">Features</h2>
      <ul className="list-disc list-inside mb-2">
        <li>Real-time network topology visualization</li>
        <li>Comprehensive metrics dashboard</li>
        <li>Time series data analysis</li>
        <li>Intent summary and management</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">Support</h2>
      <p className="mb-2">
        If you encounter any issues or have questions, please reach out to our support team at <a href="mailto:support@fyp.com" className="text-blue-500 hover:underline">support@fyp.com</a>.  We are here to help!
      </p>
      <p className="mb-2">
        Thank you for using FYP (For Your Ping)!
      </p>
    </div>
  );
}

export default Docs;