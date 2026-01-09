import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="bg-gray-50 border-b">
      <div className="container-padding py-4">
        <div className="flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition">
            {/* Replace with text or other icon */}
            <span className="text-lg">🏠</span>
          </Link>
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <span className="text-gray-400">›</span>
              
              {item.link ? (
                <Link
                  to={item.link}
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;