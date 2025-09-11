function NavBar() {
    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between">
            <h1 className="font-bold">FYP (For Your Ping)</h1>
            <div className="space-x-4">
                <button>Login</button>
                <button>Docs</button>
            </div>
        </nav>
    );
}

export default NavBar;