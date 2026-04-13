import React from 'react';

const categories = [
  { id: 1, name: 'Electrician', icon: '⚡', desc: 'Wiring & fixtures', bg: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1000&h=800&fit=crop' },
  { id: 2, name: 'Plumber', icon: '🔧', desc: 'Leaks & installations', bg: '/plumber.jpg' },
  { id: 3, name: 'Cleaning', icon: '✨', desc: 'Deep cleaning service', bg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&h=800&fit=crop' },
  { id: 4, name: 'Carpentry', icon: '🪚', desc: 'Custom furniture', bg: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&h=800&fit=crop' },
  { id: 5, name: 'Painter', icon: '🎨', desc: 'Interior walls', bg: '/painter.jpg' },
  { id: 6, name: 'Appliance Repair', icon: '🧊', desc: 'Refrigerators & AC', bg: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1000&h=800&fit=crop' },
];

const CategoryGrid = ({ onCategoryClick, searchTerm = '' }) => {
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredCategories.length === 0) {
    return <div style={{ color: 'var(--text-secondary)' }}>No services found matching "{searchTerm}"</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '1rem'
    }}>
      {filteredCategories.map((cat, idx) => (
        <div key={cat.id} 
          className={`animate-up delay-${Math.min(idx, 3)}`} 
          onClick={() => onCategoryClick(cat)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer'
          }}>
          
          <div style={{
            position: 'relative',
            backgroundImage: `url('${cat.bg}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(30, 109, 94, 0.1)', // fallback color
            height: '140px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            marginBottom: '0.75rem',
            overflow: 'hidden'
          }}>
            {/* Checkbox imitation on top left */}
            <div style={{
              position: 'absolute',
              top: '8px', left: '8px',
              width: '16px', height: '16px',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '4px',
              border: '1px solid rgba(0,0,0,0.2)'
            }}></div>
          </div>
          
          <div style={{ padding: '0 0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cat.name} Service Request
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {cat.desc}.doc
            </p>
          </div>

        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
