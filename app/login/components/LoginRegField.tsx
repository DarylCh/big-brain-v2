const LoginFieldStyle: React.CSSProperties = {
  marginBottom: '15px',
  backgroundColor: 'white',
  borderRadius: '5px',
  padding: '5px 10px',
};

// This component is an input field for the login/register pages
export const LRField = ({
  id,
  text,
  type,
  onChange,
  aria,
}: {
  id: string;
  text: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aria: string;
}) => {
  return (
    <div style={LoginFieldStyle}>
      <p>{text}:</p>
      <input
        id={id}
        type={type}
        className="form-control"
        placeholder={text}
        onChange={onChange}
        aria-label={aria}
      ></input>
    </div>
  );
};

// This component is an input field for the login/register pages
export const LRFieldBottom = ({
  id,
  text,
  type,
  onChange,
  aria,
}: {
  id: string;
  text: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aria: string;
}) => {
  return (
    <div style={LoginFieldStyle}>
      <p>{text}:</p>
      <input
        id={id}
        type={type}
        className="form-control"
        placeholder={text}
        onChange={onChange}
        aria-label={aria}
      ></input>
    </div>
  );
};
