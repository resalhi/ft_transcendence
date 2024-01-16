import socket from "@/services/socket";
import React, { useRef, useEffect, useState, use } from "react";
import { useIsDirectMessage } from "@/store/userStore";
import useRecieverStore from "@/store/recieverStore";
import useMessageStore from "@/store/messagesStore";
import Link from "next/link";
import { get } from "http";


export default function ListUsersFriends({ username }: { username: any }) {
  // request to get all users
  const [users, setUsers] = useState<any[]>([]);
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { reciever, setReciever } = useRecieverStore();
  const [friendsId, setFriendsId] = useState([]);
  const [UserName, setUserName] = useState("");
  const [noFriends, setNoFriends] = useState(false);
  const [color, setColor] = useState("bg-green-400");

  // fetch username from session storage
  const fetchUserName = async () => {
    const storedUserData = sessionStorage.getItem("user-store");
    if (storedUserData) {
      try {
        // Parse the stored data as JSON
        const userData = await JSON.parse(storedUserData);

        // Access the username property
        const savedUsername = userData.state.user.username;

        setUserName(savedUsername);
        console.log("savedUsername", savedUsername);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    } else {
      console.warn("User data not found in session storage.");
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  const getFriends = () => {
    socket.emit("getAllUsersFriends", { sender: username });

    
    socket.on("getAllUsersFriends", (data) => {
      if (data.length === 0) {
        setNoFriends(true);
      } else {
        setNoFriends(false);
      }

      const arr = [];
      for (let items of data) {
        if (items.MefriendOf?.username === UserName) {
          arr.push(items.friend);
          setUsers(arr.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)); // remove duplicates id from array
        }
      }
    });
  };

  // Use useEffect with users as a dependency to trigger the copy operation
  useEffect(() => {
    socket.on("acceptFriendRequest", (data) => {
      getFriends();
    })
    getFriends();
    return () => {
      socket.off("getAllUsersFriends");
    };
  }, [UserName]);

  // save the reciever name
  const saveReceiverName = (username: string) => {
    setReciever(username);
    setIsDirectMessage(true);
  };


  return (
    <>
      {users &&
        (Array.isArray(users) ? users : Object.keys(users)).map(
          (user: any, index) => (
            <React.Fragment key={user?.username}>
            
            <div
              className="flex items-center  justify-between py-2  hover:bg-slate-700 rounded-2xl"
              key={user?.username}
              >
              <div
                className="flex flex-col items-center"
                onClick={() => saveReceiverName(user?.username)}
              >
                <div
                  className="flex items-center justify-between  space-x-2  cursor-pointer rounded-xl"
           >
                  <img
                    className="w-14 h-14 rounded-full object-cover ml-5"
                    src={user?.avatarUrl}
                    alt="avatar"
                  />
                  <div className="flex">
                    <div className="flex flex-col"
                    
                    >
                      <span className="font-semibold text-md">
                        {user?.username}
                      </span>
                      {user?.status === "online" ? (
                        <span className="text-sm text-green-400 font-bold">
                          {user?.status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {user?.status}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              <Link href={`/profile/${user?.id}`}>
              <span
                className="cursor-pointer pr-5"
                >
                <img  className="w-7 h-7  rounded-3xl mr-2 mt-3 bg-gray-300"
                src="https://cdn1.iconfinder.com/data/icons/user-interface-4-basic-outline/24/setting_user_profile_management_project_manager-512.png" alt="" />
              </span>
                </Link>
            </div>

            </React.Fragment>
          )
          )}
    </>
  );
}
