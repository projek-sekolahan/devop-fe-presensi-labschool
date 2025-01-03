const DesktopWarning = () => {
  return (
    <div className="font-primary w-screen h-screen absolute left-0 top-0 z-50 flex justify-center items-center before:size-full before:bg-black before:opacity-40 backdrop-blur-sm before:absolute">
      <div className="modal-box">
        <h3 className="font-bold text-xl">Warning!</h3>
        <p className="py-4 text-lg">
          Harap gunakan Handphone agar dapat mengakses website
        </p>
      </div>
    </div>
  );
};

export default DesktopWarning;
