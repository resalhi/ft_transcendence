import { useState } from "react";
import { useIsDirectMessage } from "@/store/userStore";
import useRecieverStore from "@/store/recieverStore";
import AdminsMembers from "../../adminMembers/adminMembers";

export default function TopBar({
  user,
  username,
  channel,
}: {
  user: any;
  username: string;
  channel: string;
}) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { reciever, setReciever } = useRecieverStore();
  const [isDirectMessagePage, setIsDirectMessagePage] = useState(false);
  //TODO: WSALT HNA ADD RESPONSIVE FOR FRIENDS LIST



  return (
    <>
      <div className="border-b flex px-6 py-2 items-center justify-between flex-none ">
        {/* name of channal */}
        <div className="flex flex-col ">
          <div className="lg[1000px]:hidden"></div>
          <h3 className=" mb-1 font-extrabold flex items-center">
            <img
              src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678109-profile-group-256.png"
              alt=""
              className="mr-2 lg:hidden w-7 h-7 cursor-pointer"
              onClick={() => {
                setIsDirectMessagePage(!isDirectMessagePage);
              }}
            />
            <span className="text-xl font-bold opacity-50">#</span>{" "}
            {isDirectMessage ? reciever : channel}
          </h3>
        </div>


      </div>
    </>
  );
}
