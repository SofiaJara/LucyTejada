// Design system — Centro Cultural Lucy Tejada
// Paleta estrictamente monocromática (grayscale)

export const colors = {
  primary:     '#222',
  secondary:   '#333',
  text:        '#555',
  muted:       '#666',
  subtle:      '#777',
  label:       '#888',
  faint:       '#999',
  borderDark:  '#aaa',
  borderMid:   '#bbb',
  borderLight: '#ccc',
  divider:     '#ddd',
  rowBg:       '#eee',
  white:       '#ffffff',
  bgPage:      '#f5f5f5',
};

export const fonts = {
  sans:  "'Segoe UI', sans-serif",
  serif: "'Georgia', serif",
};

// Shell dimensions
export const shell = {
  navbarHeight: 46,
  sidebarWidth: 150,
};

// Reusable style objects
export const card = {
  background: '#fff',
  border:     `1px solid ${colors.borderDark}`,
  borderRadius: 6,
  padding:    '12px 14px',
};

export const outlineBtn = (size = 'md') => ({
  background:   '#fff',
  border:       `1.5px solid ${colors.secondary}`,
  borderRadius: 6,
  color:        colors.primary,
  cursor:       'pointer',
  fontFamily:   fonts.sans,
  fontSize:     size === 'sm' ? 11 : 13,
  padding:      size === 'sm' ? '4px 10px' : '7px 18px',
  display:      'inline-block',
  textDecoration: 'none',
});

export const ghostBtn = {
  background:   '#fff',
  border:       `1px solid ${colors.borderLight}`,
  borderRadius: 6,
  color:        colors.subtle,
  cursor:       'pointer',
  fontFamily:   fonts.sans,
  fontSize:     11,
  padding:      '4px 10px',
  display:      'inline-block',
  textDecoration: 'none',
};

export const inputStyle = {
  background:   '#fff',
  border:       `1.5px solid ${colors.secondary}`,
  borderRadius: 6,
  color:        colors.primary,
  fontFamily:   fonts.sans,
  fontSize:     13,
  padding:      '7px 12px',
  width:        '100%',
  boxSizing:    'border-box',
  outline:      'none',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

export const tableHeader = {
  background:  '#fff',
  border:      `1px solid ${colors.borderDark}`,
  fontSize:    12,
  fontWeight:  600,
  color:       colors.primary,
  padding:     '8px 10px',
  textAlign:   'left',
};

export const tableCell = {
  fontSize:  12,
  color:     colors.text,
  padding:   '8px 10px',
  borderBottom: `1px solid ${colors.divider}`,
};
