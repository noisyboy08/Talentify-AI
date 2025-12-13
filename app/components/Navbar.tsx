import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <Link to="/">
        <p className="text-xl sm:text-2xl font-bold text-gradient float-3d">TALENTIFY AI</p>
      </Link>
      <div className="flex gap-2 sm:gap-3 items-center">
        <Link to="/dashboard" className="px-2 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 transition-colors font-medium">
          Dashboard
        </Link>
        <Link to="/upload" className="primary-button w-fit glow-3d text-sm sm:text-base px-3 sm:px-4 py-2">
          Upload Resume
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
