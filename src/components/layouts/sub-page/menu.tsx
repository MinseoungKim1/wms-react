import { Children } from "react";
import { Link } from "react-router-dom";

interface MenuProps {
  onClose: () => void;
}

export default function Menu({onClose}: MenuProps) {
    const menuItems = [
        {
            name: "SmartWES", path: "/", Children: [
                { name: "home", path: "/" },
            ]},
        {
            name: "History", path: "/history", Children: [
                { name: "inbound history", path: "/history/inbound" },
                { name: "outbound history", path: "/history/outbound" },
                { name: "carrier history" , path: "/history/carrier"},
            ]},
        {
            name: "Inbound", path: "/inbound", Children: [
                { name: "material inbound", path: "/inbound/material" },
                { name: "ETC inbound", path: "/inbound/ETC" },
                {name: "inbound" , path: "/inbound/inbound"},
            ]},
        {
            name: "Outbound", path: "/outbound", Children: [
                { name: "material outbound", path: "/outbound/material" },
                { name: "ETC outbound", path: "/outbound/ETC" },
                {name: "outbound" , path: "/outbound/outbound"},
            ]},
        {
            name: "Material", path: "/material", Children: [
                { name: "inbound material", path: "/material/inbound" },
                { name: "outbound material", path: "/material/outbound" },
                {name: "etc material" , path: "/material/ETC"},
        ]
      },
        {
            name: "Monitering", path: "/monitering", Children: [
              { name: "Monitering", path: "/monitering/monitering" },
              { name: "NewMonitering", path: "/monitering/Newmonitering" },
              { name: "FABMonitering", path: "/monitering/FABmonitering" },
                // { name: "outbound material", path: "/material/outbound" },
                // {name: "etc material" , path: "/material/ETC"},
            ]},
    ];
    
    return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors h-full overflow-hidden"
          >
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.name}
                </span>
                <span className="text-gray-400 text-sm group-hover:translate-x-1 transition-transform">
                ▼
              </span>    

            </div>
            {/* 2. 소카테고리 리스트 */}
            <div className="p-4 flex flex-col gap-1.5">
              {item.Children.length > 0 ? (
                item.Children.map((sub) => (
                  <Link
                    key={sub.name}
                    to={sub.path}
                    onClick={onClose}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors block"
                  >
                    {sub.name}
                  </Link>
                ))
              ) : (
                  <Link
                    to={item.path}
                    onClick={onClose}
                  className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors block"
                  >
                    Home
                </Link>
                  // <span className="text-xs text-gray-400 px-3 py-2">
                //   바로가기 메뉴 없음
                // </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

