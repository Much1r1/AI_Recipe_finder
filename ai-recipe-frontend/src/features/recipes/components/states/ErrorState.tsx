type Props = {
    message?: string;
  };
  
  export default function ErrorState({ message }: Props) {
    return (
      <div className="state-container error">
        <p className="state-title">Something went wrong</p>
        <p className="state-text">
          {message || "Please try again in a moment."}
        </p>
      </div>
    );
  }
  