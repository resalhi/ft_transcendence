import socket from "@/services/socket";
import { channel } from "diagnostics_channel";
import { redirect } from "next/dist/server/api-utils";
import { useState, useEffect, use } from "react";
import { IoClipboardSharp } from "react-icons/io5";

const Notification = ({ user }: { user: any }) => {
  const [notificationForFriend, setNotificationForFriend] = useState(false);
  const [sender, setSender] = useState<any[]>([]);
  const [senderUsername, setSenderUsername] = useState("");
  const [channelname, setChannelname] = useState("");
  const [userWhoSendInvite, setUserWhoSendInvite] = useState("");
  const [userWhoWillaAcceptInvite, setUserWhoWillaAcceptInvite] = useState("");
  const [userWhoSendInviteToGame, setUserWhoSendInviteToGame] = useState("");
  const [userWhoWillaAcceptInviteToGame, setUserWhoWillaAcceptInviteToGame] = useState("");

  const getAllNotification = () => {
    
    socket.emit("notification", {username: user.username});
    socket.on("notification", (data) => {
      setSender([]);
      setSenderUsername("");

      for (let i = 0; i < data.length; i++) {
        if (data[i]?.senderRequests?.username !== user.username) { // check if sender is not current user
          setSender((sender) => [...sender, data[i]?.senderRequests]); // save all sender requests to state
          setSenderUsername(data[i]?.receiverRequests?.username); // save current user username
          setNotificationForFriend(!notificationForFriend);
        }
      
      }
    });

    socket.emit("listinviteChannel", {username: user.username});
    socket.on("listinviteChannel", (data) => {
      data.forEach((element: any) => {
        socket.emit("getChannelById", {id: element?.channelId});
        socket.on("getChannelById", (channel) => {
          setChannelname(channel?.name);
        })
        socket.emit("getUserById", {id: element?.senderId});
        socket.on("getUserById", (sender) => {
          setUserWhoSendInvite(sender?.username);
        })
        setUserWhoWillaAcceptInvite(user?.username);
      }
      );

    });

    // list invite to game 
    socket.emit("listinviteGame", {username: user?.username});
    socket.on("listinviteGame", (data) => {
      data.forEach((element: any) => {
        socket.emit("getUserById", {id: element?.senderId});
        socket.on("getUserById", (sender) => {
          setUserWhoSendInviteToGame(sender?.username);
        })
        setUserWhoWillaAcceptInviteToGame(user?.username);
      }
      );
    })

    console.log(userWhoWillaAcceptInviteToGame, userWhoSendInviteToGame);

    return () => {
      socket.off("notification");
      socket.off("listinviteChannel");
      socket.off("getChannelById");
      socket.off("getUserById");
    }
  };
;


  const saveFriendsToDB = async (senderUsername: string) => {
    // add sender to reciever friends list
    socket.emit("acceptFriendRequest", {
      sender: senderUsername,
      receiver: user.username,
    });

    setNotificationForFriend(!notificationForFriend);
    // remove notification from state
    setSender([]);
  };

  const emtyBoxOfNotification = () => {
    
    setChannelname("");
    setUserWhoSendInvite("");
    setUserWhoWillaAcceptInvite("");
    setNotificationForFriend(!notificationForFriend);
    setUserWhoSendInviteToGame("");
    setUserWhoWillaAcceptInviteToGame("");
  }

  const saveNewChannelToDB = async (channelName: string) => {
   // update channel status to accepted
    socket.emit("sendInviteToChannel", {
      sender: userWhoSendInvite,
      friend: userWhoWillaAcceptInvite,
      channel: channelName,
      status: "accepted", 
    });
    socket.on("sendInviteToChannel", (data : any) => {
      socket.emit("saveAcceptedChannelToDB", {
        friend: userWhoWillaAcceptInvite,
        status: data.status, 
        channelId: data.channelId
      })
      
    });
    emtyBoxOfNotification();
    setNotificationForFriend(!notificationForFriend);

    
  }

  const redirectTogame = () => {
  //update to accepted
  // redirect to game
  socket.emit("inviteToGame", {
    sender: userWhoSendInviteToGame,
    receiver: userWhoWillaAcceptInviteToGame,
    status: "accepted", 
  });


  window.location.href = "/game";

  }
  
 
  return (
    <>
      <div className="relative m-6 inline-flex w-fit">
        <div className="nav-avatars_notificationIcon">
          <div className="notification-badge"></div>
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 16 21"
            onClick={() => getAllNotification()}
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 3.464V1.1m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175C15 15.4 15 16 14.462 16H1.538C1 16 1 15.4 1 14.807c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 8 3.464ZM4.54 16a3.48 3.48 0 0 0 6.92 0H4.54Z"
            />
          </svg>
          {notificationForFriend &&  user?.username === senderUsername && (
            <>
            { sender && sender.length > 0 && (
                <div className="absolute top-0 right-0 w-64 p-2 mt-10 z-40 bg-white rounded-md shadow-xl dark:bg-gray-800">
                {sender &&
                  sender.map((sender) => (
                      <div className="flex items-center justify-between mt-10">
                      <div className="flex items-center">
                          <img
                          className="object-cover w-8 h-8 rounded-full"
                          src={sender?.avatarUrl}
                          alt="avatar"
                          />
                          <p className="mx-2 text-sm text-gray-800 dark:text-gray-200">
                          {sender?.username}
                          </p>
                      </div>
                        <div className="flex items-center">
                            <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                            onClick={() => {saveFriendsToDB(sender.username)}}
                            >
                            Accept
                            </button>
                            <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400"
                            onClick={() => {emtyBoxOfNotification()}}
                            >
                            ignore
                            </button>
                        </div>
                      </div>
                ) 
                )}
            </div>
            )}
            {
              sender && sender.length === 0 && (
                <div className="absolute top-0 right-0 w-64 p-2 mt-10 z-40 bg-white rounded-md shadow-xl dark:bg-gray-800">
                  <p className="mx-2 text-sm text-gray-800 dark:text-gray-200">You have no notification</p>
                </div>
              )
            }
                </>
          )}
        </div>
           {
           channelname &&  user?.username !== userWhoSendInvite  &&
            (
              <div className="absolute top-0 right-0 w-64 p-2 mt-10 z-40 bg-white rounded-md shadow-xl dark:bg-gray-800">
                    <p className="mx-2 text-sm text-gray-800 dark:text-gray-200"> <span
                    className="text-sm text-gray-800 dark:text-gray-200 font-bold"
                    >
                    {userWhoSendInvite}</span> Invite you to a channel <span
                    className="text-sm text-gray-800 dark:text-gray-200 font-bold"
                    >
                    {channelname}</span> </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                    onClick={() => {saveNewChannelToDB(channelname)}}
                    >
                      Accept
                    </button>
                    <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400"
                    onClick={() => {emtyBoxOfNotification()}}
                    >
                      ignore
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          {
           userWhoWillaAcceptInviteToGame &&  user?.username !== userWhoSendInviteToGame  &&
            (
              <div className="absolute top-0 right-0 w-64 p-2 mt-10 z-40 bg-white rounded-md shadow-xl dark:bg-gray-800">
                    <p className="mx-2 text-sm text-gray-800 dark:text-gray-200"> <span
                    className="text-sm text-gray-800 dark:text-gray-200 font-bold"
                    >
                    {userWhoSendInviteToGame}</span> Invite you to play game </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                    onClick={() => {redirectTogame()}}
                    >
                      Accept
                    </button>
                    <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400"
                    onClick={() => {emtyBoxOfNotification()}}
                    >
                      ignore
                    </button>
                  </div>
                </div>
              </div>
            )
          }
      </div>

    </>
  );
};

export default Notification;
