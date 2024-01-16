import { redirect } from "next/dist/server/api-utils";

export default function SearchResult({ searchResult, userId }: { searchResult: any, userId: any }) {
    
   async function redirectToprofile(userId: any) {
      // redirect to profile page
      console.log("userId", userId)
      window.location.href = `http://localhost:3000/profile/${userId}`
      
    }

  return (
    <div className="search-users">
      {searchResult.map((user: any, index: number) => {
        return (
            <div className="flex flex-col px-4 py-2 " key={index}
              onClick={() => {redirectToprofile(userId)}}
            >
              <div className="flex px-4 py-2 text-white font-bold cursor-pointer border rounded-lg shadow-lg bg-backgroundColorPrimery border-gray-600 hover:bg-slate-900 hover:text-green-300">
              <img src={user.avatarUrl} alt="user" className="w-8 h-8 mr-5 rounded-full" />
                <p>{user.username}</p>
              </div>
            </div>
        );
      })}
    </div>
  );
}
