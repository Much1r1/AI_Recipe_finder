type Props = {
    reasons?: string[];
  };
  
  export default function WhyThisRecipe({ reasons = [] }: Props) {
    if (!reasons.length) return null;
  
    return (
      <div className="mt-2 text-sm text-gray-600">
        <p className="font-medium text-gray-800">Why this recipe?</p>
        <ul className="list-disc list-inside">
          {reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>
    );
  }
  