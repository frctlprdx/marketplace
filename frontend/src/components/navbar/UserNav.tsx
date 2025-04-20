const UserNav = () => {

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); // refresh biar navbar update
  };

  return (
    <div className="flex items-center space-x-4">
        <button className="text-gray-700 text-xl sm:text-2xl hover:text-black">❤️</button>
        <button className="text-gray-700 text-xl sm:text-2xl hover:text-black">🛒</button>
        <button onClick={handleLogout} className="text-gray-700 text-xl sm:text-2xl hover:text-black">👤</button>
    </div>
  );
}
export default UserNav;