import ResultCard from "./ResultCard";

export default function ResultsPanel({
  results,
  downloadPdf,
}) {

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-[320px] bg-white border-l border-gray-200 p-6 overflow-y-auto">

      <h2 className="text-gray-700 font-bold tracking-[3px] mb-10">
        RÉSULTATS
      </h2>

      {!results ? (

        <div className="text-gray-500">
          Aucun résultat disponible.
        </div>

      ) : (

        <div className="space-y-5">

          <ResultCard
            title="☀️ Panneaux"
            value={results.panneaux}
          />

          <ResultCard
            title="⚡ Puissance"
            value={results.power}
          />

          <ResultCard
            title="🔋 Batterie"
            value={results.battery}
          />

          <ResultCard
            title="⚡ Onduleur"
            value={results.inverter}
          />

          <ResultCard
            title="📈 Production"
            value={results.production}
          />

          <ResultCard
            title="💰 ROI"
            value={results.roi}
          />

          <button
            onClick={downloadPdf}
            className="w-full bg-[#163b67] hover:bg-[#102d50] transition text-white py-4 rounded-2xl font-bold"
          >
            Télécharger PDF
          </button>

        </div>

      )}

    </aside>
  );
}