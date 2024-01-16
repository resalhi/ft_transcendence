"use client";
import socket from "@/services/socket";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import useUsernameStore from "@/store/usernameStore";

export default function AddFriends() {
  const { username, setUsername } = useUsernameStore();
  const [receiver, setceiverId] = useState("");
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [blocked, setBlocked] = useState(false);

  // Get the id of the user from the URL
  const params = useParams();
  const userId = params.id;

  const fetchUser = async () => {
    // Fetch the username from session storage
    const storedUserData = sessionStorage.getItem("user-store");

    if (storedUserData) {
      // Parse the stored data as JSON
      const userData = await JSON.parse(storedUserData);

      // Access the username property
      const savedUsername = userData.state.user?.username;

      // Set the username
      setUsername(savedUsername);
      const id = userId;
      socket.emit("getUserById", {
        id: id,
      }); // as sender
      socket.on("getUserById", (data) => {
        const receiver = data.username;
        setceiverId(receiver);
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const sentFriendRequest = () => {
    // Emit send friend request
    socket.emit("sendFriendRequest", {
      receiverInvite: userId,
      senderInvite: username,
    });

    // Emit notification
    socket.emit("notification", {
      username: username,
    });
    setFriendRequestSent(true);
  };

  const getAllUsersFriends = () => {
    try {    
      socket.emit("getAllUsersFriends", { sender: username });
      socket.on("getAllUsersFriends", (data) => {
        data.map((item :any) => {
          if (item.friend.username === receiver) {
            setAccepted(true);
          }
        });}
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  useEffect(() => {
    getAllUsersFriends();
    return () => {
      socket.off("sendFriendRequest");
      socket.off("getAllUsersFriends");
    };
  }, [username, receiver, userId]);


  // Block user
  const handleBlockUser = () => {
    console.log("username", username, receiver);
    socket.emit("blockUser", {
      willbocked: username,
      whoblocked: receiver,
    });
    socket.on("blockUser", (data) => {
      console.log("data", data);
      if (data) {
        setBlocked(true);
      }
    }
    );
    return () => {
      socket.off("blockUser");
    }
  };


  // Invite to game
  const handleInviteToGame = () => {
    socket.emit("inviteToGame", {
      sender: username,
      receiver: receiver,
      status: "pending",
    });
    socket.on("inviteToGame", (data) => {
      console.log("data", data);
    }
    );
    socket.on("inviteToGame", (data) => {
      if(data.status === "accepted")
        window.location.href = "/game";
    });
    // list to acepted
    return () => {
      socket.off("inviteToGame");
    }
  };


  return (
    <>
      {receiver !== username ? (
        !friendRequestSent && !accepted && !pending ? (
          <div className="flex  flex-col">
            <button
              className="p-2 px-4 text-xs text-white font-bold w-32 bg-gray-500 border rounded-full shadow-lg mt-9 hover:bg-gray-600 py-2"
              onClick={() => {
                sentFriendRequest();
              }}
            >
              Add Friend
            </button>
          </div>
        ) : friendRequestSent ? (
          <div className="flex  flex-col">
            <button
              className="p-2 px-4 text-xs text-white font-bold w-32 bg-gray-500 border rounded-full shadow-lg mt-9 hover:bg-gray-600 py-2"
            >
              Friend Request Sent
            </button>
          </div>
        ) : (
          <div className="invite-btns">
            <>
              {accepted && (
                <>
                  <button className="p-2 px-4 text-xs  mt-3 w-32 border rounded-full shadow-lg  bg-red-500 hover:bg-red-600 text-white font-bold py-2 "
                  onClick={() => {
                    handleBlockUser();
                  } }
                  >
                    {blocked ? "Blocked" : "Block User"}
                  </button>
                  <button className="p-2 px-4 text-xs  mt-3 w-32 border rounded-full shadow-lg  bg-green-500 hover:bg-green-600 text-white font-bold py-2 "
                  onClick={() => {
                    handleInviteToGame();
                  } }
                  >
                    invite to game
                  </button>
                </>
              )}
            </>
          </div>
        )
      ) : pending ? (
        <div className="flex  flex-col">
          <button
            className="p-2 px-4 text-xs text-white font-bold w-32 bg-gray-500 border rounded-full shadow-lg mt-9 hover:bg-gray-600 py-2"
          >
            Pending
          </button>
        </div>
      ) :null
      }
    </>
  );
}
