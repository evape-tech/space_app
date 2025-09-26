// import Navbar from './navbar'
import Footer from "./footer";

export default function LayoutWoAuth({ children }) {
  return (
    <div
      className="w-full h-screen
        text-[#333333]"
    >
      <main>
        <div className="p-[7%]">{children}</div>
      </main>
    </div>
  );
}
