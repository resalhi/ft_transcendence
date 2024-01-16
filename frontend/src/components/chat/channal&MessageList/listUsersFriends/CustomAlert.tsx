import './CustomAlert.css';


const CustomAlert = ({ message} : any) => {
  
 const closeAlert = () => {
    const alert = document.querySelector('.custom-alert') as HTMLElement;
    alert.style.display = 'none';
  }
  
  return (
    <>
        <div className="custom-alert">
          <div className="custom-alert-content">
            <div className="custom-alert-message">{message}</div>
            <div className="custom-alert-button cursor-pointer" onClick={closeAlert}>
              <img className='h-5 w-5'
              src="https://cdn3.iconfinder.com/data/icons/iconano-text-editor/512/005-X-512.png" alt="" /></div>
          </div>
        </div>
    </>
  )
};

export default CustomAlert;