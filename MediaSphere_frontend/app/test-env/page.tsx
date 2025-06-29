"use client"

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong> {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">API Test</h2>
        <button 
          onClick={async () => {
            try {
              const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/`
              console.log('Testing API URL:', apiUrl)
              const response = await fetch(apiUrl)
              const data = await response.json()
              console.log('API Response:', data)
              alert('API call successful! Check console for details.')
            } catch (error) {
              console.error('API Error:', error)
              alert(`API call failed: ${error.message}`)
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test API Call
        </button>
      </div>
    </div>
  )
} 