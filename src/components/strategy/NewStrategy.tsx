{/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Strategy</label>
        <textarea
          value={newStrategy}
          onChange={(e) => setNewStrategy(e.target.value)}
          className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter your strategy code here..."
        />
        <button
          onClick={handleNewStrategySubmission}
          disabled={!newStrategy.trim()}
          className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          Add Strategy
        </button>
      </div>
      {registrationStatus.message && (
        <div className={`p-3 rounded-md ${registrationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {registrationStatus.message}
        </div>
      )} */}