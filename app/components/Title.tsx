import React from 'react';

const TitleStyle: React.CSSProperties = {
  color: '#FF5003',
  fontSize: '28px',
  fontWeight: 'semi-bold',
};

// This component is used by other components as a heading title
const Title = ({
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 style={{ ...TitleStyle, ...style }} {...props}>
      {children}
    </h2>
  );
};

export default Title;
