import { useState } from "react"
import socket from "@/services/socket"
import SearchResult from "./searchResult"

export default function SearchBar() {
    const [input, setInput] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [userId, setUserId] = useState('')
    const [user, setUsername] = useState('')

    // fetch data from backend
    const search = (e : any) => {
        
        if (e.target.value === '') {
            setInput('')
            setUsername('')
            setSearchResult([])
            return ;
        }
        setInput(e.target.value)
        setUsername(e.target.value)
        if (input === '') {
            socket.emit('searchUser', '')
        }
        socket.emit('searchUser', user)
        socket.on('searchUser', (data) => {
            // filter data and search for user
            const filteredData = data.filter((user : any) => {
                return user.username.toLowerCase().includes(input.toLowerCase())})
            const userId = filteredData[0]?.id;
            setSearchResult(filteredData)
            setUserId(userId)
        })        
    }

    return (
        <div className="nav-searchForm flex items-center">
            <form>
                <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                    Search
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-500 dark:text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                            />
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search Friends"
                        required
                        value={input}
                        onChange={(e) => search(e)}
                        // clear search before submit
                        onSubmit={(e) => {
                            e.preventDefault()
                            setInput('')
                        }}
                    />
                    <button
                        type="submit"
                        className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Search
                    </button>
                </div>
                {searchResult.length > 0 && <SearchResult searchResult={searchResult} userId={userId}/>}
            </form>
        </div>
    )
}