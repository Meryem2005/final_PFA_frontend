export default function ResultCard({ title, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span>{title}</span>

      <span className="font-bold text-[#163b67]">
        {value}
      </span>
    </div>
  );
}