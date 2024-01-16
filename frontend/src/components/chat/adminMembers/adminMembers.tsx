"use client";
import { useIsDirectMessage } from "@/store/userStore";
import { use, useEffect, useState } from "react";
import socket from "@/services/socket";
import { useChannleIdStore } from "@/store/channelStore";
import useUsernameStore from "@/store/usernameStore";

export default function AdminsMembers({
  user,
  channel,
}: {
  user: any;
  channel: string;
}) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { channelId, setChannelId } = useChannleIdStore(); // channel id
  const [members, setMembers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [Setting, setSetting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ShowTimeMuted, setShowTimeMuted] = useState<boolean>(false);
  const [member, setMember] = useState<string>("");
  const [sender, setSender] = useState<string>("");
  const [justMemebre, setJustMemebre] = useState<boolean>(false);
  const [disableListMembers, setDisableListMembers] = useState<boolean>(false);
  const [showMembersAndAdminsCmp, setShowMembersAndAdmins] =
    useState<boolean>(false);
  const { username, setUsername } = useUsernameStore();
  const [annoncement, setAnnoncement] = useState("");
  const [Muted, setMuted] = useState<boolean>(false);


    
  const listMembers = (channelId: string) => {
    socket.emit("getChannelById", { id: channelId });
    socket.on("getChannelById", (data: any) => {
      if (data?.visibility === "public" || data?.visibility === "protected") {
        setDisableListMembers(true);
        return;
      } else {
        
        socket.emit("ChannelMembers", { channelId, username });
        socket.on("ChannelMembers", (data: any) => {
          // if (username !== data[0]?.username) return;
          // TODO: filter the sender
          data?.map((member: any) => {
            // filter the owner and admins
            setMembers(data);
          });
        });
        
      }
    });
  
  };

  // TODO: 3ANDI NAFS ADMIN F 2 DIFFERENT CLIENTS
  
  const listAdmins = (channelId: string) => {

    // list all admins in the channel
    socket.emit("GetChannelAdmins", { channelId });
    socket.on("GetChannelAdmins", (data: any) => {
      // if(user.username !== data[0]?.username) return;
      for (let i = 0; i < data.length; i++) {
        setAdmins((admins) =>
          [...admins, data[i]?.user].filter(
            (v, i, a) => a.findIndex((t) => t?.username === v?.username) === i
          )
        );
      }
    });


  };

  // list all members in the channel
  useEffect(() => {
    if (channelId) {
      listAdmins(channelId);
      listMembers(channelId);
    }
    return () => {
      socket.off("ChannelMembers");
      socket.off("ChannelAdmins");
      socket.off("getUserById");
      socket.off("getChannelById");
      socket.off("GetChannelAdmins");
      setDisableListMembers(false);
      setAdmins([]);
      setMember([]);
    };
  }, [channelId]);

  const makeAdmin = (channelId: string) => {

    const sender = username; // set same samiya for backend
    socket.emit("makeAdmin", { sender, member, channelId });
    socket.on("makeAdmin", (data: any) => {
      if (!data) {
        setAnnoncement("you are can not make the member admin");
      } else if (data === "you can not make your self admin") {
        setAnnoncement("you can not make your self admin");
      } else {
        setAnnoncement("admin added");
        listAdmins(channelId)
      }
    });
    return () => {
      socket.off("makeAdmin");
    }
  };

  const kickMember = (channelId: string) => {

    const sender = username; // set same samiya for backend
    socket.emit("kickMember", { sender, member, channelId });
    socket.on("kickMember", (data: any) => {
      if (!data) {
        setAnnoncement("you are can not kick the member");
      } else if (data === "you can not kick your self")
      {
        setAnnoncement("you can not mute yoursef");
      }
      else{
        setAnnoncement("member kicked");
        listMembers(channelId);
      }
    });
    return () => {
      socket.off("kickMember");
    }
  };

  const BanMember = (channelId: string) => {

    const sender = username; // set same samiya for backend
    console.log("user ", username, "banned member ", member, "in channel ", channelId)
    socket.emit("BanMember", { sender, member, channelId });
    socket.on("BanMember", (data: any) => {
      console.log("data", data)
      if (!data) {
        setAnnoncement("you can't ban the member");
      }else if (data === "you can not ban your self") {
        setAnnoncement("you can not ban your self");
      } else {
        listMembers(channelId);
        setAnnoncement("member banned");
      }
    });
    return () => {
      socket.off("BanMember");
    }
  };

  const wait = (duration : any) => new Promise(resolve => setTimeout(resolve, duration));


  const timeToUnmute = async () => {
    const muteDuration = 20 * 1000; // 20 seconds
    const sender = username; // set same samiya for backend
    
    // Wait for the specified duration
    await wait(muteDuration);
  
    
    // setMuted(true);
    const Muted = true;
    console.log("member", member, "unmuted by", sender, "in channel", channelId, "muted", Muted);
    socket.emit("MuteMember", { sender, member, channelId, Muted });
    setAnnoncement("member " + member + " has been unmuted");
  };

  const MuteMember = ( channelId: string) => {

    if (!username || !member || !channelId) return;
    const sender = username; // set same samiya for backend
    socket.emit("MuteMember", { sender, member, channelId, Muted });
    socket.on("MuteMember", (data: any) => {
      if (data === "owner muted member") {
        setShowTimeMuted(!ShowTimeMuted);
        listMembers(channelId);
        setAnnoncement("member " + member + " muted for 20 seconds");
        timeToUnmute();
      } else if (data === "admin muted member") {
        setShowTimeMuted(!ShowTimeMuted);
        listMembers(channelId);
        setAnnoncement("admin muted member");
        timeToUnmute();
      }else if (data === "you can not mute an admin or owner"){
        setAnnoncement("you can not mute an admin or owner");
        return;
      }
      else if (data === "you can not mute your self") {
        setAnnoncement("you can not mute your self");
      } else {
        setJustMemebre(!justMemebre);
        return;
      }
    });


    return () => {
      socket.off("MuteMember");
    }
  };



  const close = () => {
    setSetting(!Setting);
    setShowTimeMuted(!ShowTimeMuted);
    setJustMemebre(false);
    setAnnoncement("");
    setMuted(false);
  };

  const saveSender = (member: string) => {
    setMember(member);
    setSetting(!Setting);
  };

  const hideAdminsMembers = () => {
    const adminMembers = document.querySelector(".adminMembers");
    if (adminMembers?.classList.contains("hidden"))
      adminMembers?.classList.remove("hidden");
    else adminMembers?.classList.toggle("hidden");

    setShowMembersAndAdmins(!showMembersAndAdminsCmp);
  };
  console.log("🚀 ~ admins:", admins)

  return (
    <>
      {channel === "general" || disableListMembers ? (
        <div></div>
      ) : (
        <>
          <button
            className="absolute top-0 right-0  mt-2 mr-3 flex items-center"
            onClick={() => hideAdminsMembers()}
          >
            <img
              className="h-7 w-7 bg-slate-300 rounded-2xl border hover:bg-green-400"
              src="https://cdn3.iconfinder.com/data/icons/basic-mobile-part-2/512/large_group-512.png"
              alt=""
            />
          </button>
          {showMembersAndAdminsCmp && (
            <div
              className="bg-slate-900 rounded-2xl border border-gray-700  adminMembers
    "
            >
              {!isDirectMessage ? (
                <>
                  {/* admins */}
                  <button
                    className=" rounded-3xl p-3"
                    onClick={() => hideAdminsMembers()}
                  >
                    <img
                      className="h-7 w-7 bg-slate-300 rounded-2xl border hover:bg-green-400"
                      src="https://cdn3.iconfinder.com/data/icons/squared-business-financial/64/delete-cancel-512.png"
                      alt=""
                    />
                  </button>
                  <h3 className=" font-light text-white pl-8 py-10 opacity-50">
                    # Admins
                  </h3>
                  {admins?.map((admin, index) => (
                    <div
                      key={admin?.username}
                      className="flex flex-col items-center relative w-56 mb-5 
                        -ml-10 2xl:flex-row 2xl:justify-start 2xl:items-center 2xl:ml-10"
                    >
                      <img
                        src={admin?.avatarUrl}
                        alt=""
                        className="rounded-full h-14 -ml-5 mr-2 "
                      />
                      <span className="text-white font-bold  opacity-90 2xl:ml">
                        {admin?.username}
                      </span>
                    </div>
                  ))}
                  {/* members */}
                  <h3 className=" font-light text-white pl-8 py-10 opacity-50">
                    # Members
                  </h3>

                  {members?.map((member, index) => (
                    <div key={member.username} className="ml-8 w-56 mb-5">
                      <div
                        className="flex flex-row items-center "
                      >
                        <img
                          src={member?.avatarUrl}
                          alt=""
                          className="rounded-full h-14 "
                        />
                        <button
                          className="border rounded-3xl text-sm p-1 ml-6 border-gray-700 hover:bg-gray-700 "
                          onClick={() => saveSender(member?.username)}
                        >
                          <img
                            className="h-7 w-7 bg-slate-300 rounded-2xl hover:bg-green-400"
                            src="https://cdn4.iconfinder.com/data/icons/yuai-mobile-banking-vol-1/100/yuai-1-09-512.png"
                            alt=""
                          />
                        </button>
                      </div>
                      <div>
                      <span className="text-white font-bold  opacity-90">
                        {member?.username}
                      </span>
                      </div>

                      {Setting && (
                        <div className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-gray-900 via-slate-900 to-slate-800 w-[400px] h-[825px] rounded-lg flex flex-col items-center justify-center">
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border border-gray-700 hover:bg-gray-700"
                            onClick={() =>
                              makeAdmin(channelId)
                            }
                          >
                            Make Admin
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              kickMember(channelId)
                            }
                          >
                            Kick User
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              BanMember(channelId)
                            }
                          >
                            Ban User
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              MuteMember(channelId)
                            }
                          >
                            Mute User
                          </button>
                          
                            <div className="flex flex-col items-center justify-center">
                              <h6 className="text-white font-thin text-base">
                                <span className="text-red-500">
                                  {annoncement}
                                </span>
                              </h6>
                            </div>
                        
                          <button
                            className=" mr-70 border rounded-3xl text-sm p-1 max-w-20 border-gray-700 hover:bg-gray-700 "
                            onClick={() => close()}
                          >
                            close
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <hr />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
