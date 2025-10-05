"use client";

export default function LoginScreen() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 font-sans">
            <div className="w-full max-w-md mx-auto text-center bg-white p-10 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
                <p className="text-gray-600 mb-6">Please sign in to continue.</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 text-left">
                    <p className="font-semibold text-gray-800">For Hackathon Judging:</p>
                    <p className="font-semibold text-sm text-gray-700 mt-1">
                        Please add this account to your google accounts to test the Google Calendar integration:
                    </p>
                    <ul className="text-sm text-gray-700 list-disc list-inside mt-2">
                        <li>
                            <strong>Email:</strong> rewind.recode@gmail.com
                        </li>
                        <li>
                            <strong>Password:</strong> rewind@123
                        </li>
                    </ul>
                </div>
                <button
                    onClick={() => (window.location.href = "http://localhost:8000/auth/login")}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C44.438,36.338,48,30.338,48,24c0-1.932-0.219-3.792-0.611-5.599L43.611,20.083z"></path>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </main>
    );
}