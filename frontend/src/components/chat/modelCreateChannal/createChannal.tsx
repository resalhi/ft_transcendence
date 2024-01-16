import { useState } from "react";
import { useChannleTypeStore } from "@/store/channelStore"

export default function CreateChannal(props : any) {
  const [showModal, setShowModal] = useState(false);
  const [channelName, setChannelName] = useState('');
  const { channel, setChannel } = useChannleTypeStore(); // type of channel
  const [password, setPassword] = useState('');
  


  const handleInputChange = (event : any) => {
    setChannelName(event.target.value);
  };


  const handleAddChannel = () => {
    // Call the addChannel function from props to pass the channelName to the main component
    if (channelName === "" || channel === "") {
      alert("Please enter fill required field");
      return;
    }
    props.addChannel(channelName, password);
    setChannelName('');
    // Close the modal
    setShowModal(false);
    window.location.reload();
  };


  return (
    <div>
      <button className="" onClick={() => setShowModal(true)}>
        <svg
          className="fill-current h-4 w-4 opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        </svg>
      </button>

      {showModal && (
        <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-slate-800 rounded-2xl p-5 w-96">
            <span className="font-bold text-white "> Name of channel</span>
            <div className="flex items-center justify-between">
              <input
                type="text"
                placeholder="name of channel"
                className="bg-slate-900 w-full my-5 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
                value={channelName}
                onChange={handleInputChange}
              />
            </div>

            {/* type of channel */}
            <div className="flex items-center">
              <div className="mx-5">
                <input type="radio" name="type" value="public" 
                 onChange={(e) => setChannel("public")}
                />
                <label className="text-white px-3">Public</label>
              </div>
              <div>
                <input type="radio" name="type" value="private" 
                  onChange={(e) => setChannel("private")}
                />
                <label className="text-white px-3">Private</label>
              </div>
                <input type="radio" name="type" value="protected"
                  onChange={(e) => setChannel("protected")}
                 />
                <label className="text-white px-3"
                >Protected</label>
            </div>
            {
              channel === "protected" && (
                <div>
                  <input type="text" 
                    name="password" 
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)
                    
                  }
                  className="bg-slate-900 w-full my-5 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
                  />
                </div>
              )
            }
            <div className="flex justify-center mt-5 items-center">
              <button
                className="bg-slate-900 text-white px-4 py-2 rounded-lg mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-slate-900 text-white px-4 py-2 rounded-lg"
                onClick={handleAddChannel}
              >
                Add Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
