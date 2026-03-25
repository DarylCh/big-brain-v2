import React from 'react';

const TitleStyle = {
  margin: '5px 0 25px 0',
  color: '#FF5003',
}

// This component is used by other components as a heading title
const Title: React.FC<{ name: string }> = ({ name }) => {
  return (
    <h2 style={TitleStyle}>{name}</h2>
  )
}

export default Title;
