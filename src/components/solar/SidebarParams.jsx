export default function SidebarParams({
  consommation,
  setConsommation,
  surface,
  setSurface,
  budget,
  setBudget,
  calculateSolar,
}) {

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[320px] bg-white border-r border-gray-200 p-6 overflow-y-auto">

      <h2 className="text-gray-700 font-bold tracking-[3px] mb-8">
        PARAMÈTRES
      </h2>

      {/* CONSOMMATION */}

      <div className="mb-7">

        <div className="flex justify-between mb-2">

          <span className="text-sm text-gray-600 font-medium">
            CONSOMMATION
          </span>

          <span className="font-bold text-[#163b67]">
            {consommation} kWh
          </span>

        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={consommation}
          onChange={(e) => setConsommation(e.target.value)}
          className="w-full accent-[#f5a623]"
        />

      </div>

      {/* SURFACE */}

      <div className="mb-7">

        <div className="flex justify-between mb-2">

          <span className="text-sm text-gray-600 font-medium">
            SURFACE
          </span>

          <span className="font-bold text-[#163b67]">
            {surface} m²
          </span>

        </div>

        <input
          type="range"
          min="10"
          max="200"
          value={surface}
          onChange={(e) => setSurface(e.target.value)}
          className="w-full accent-[#f5a623]"
        />

      </div>

      {/* BUDGET */}

      <div className="mb-7">

        <div className="flex justify-between mb-2">

          <span className="text-sm text-gray-600 font-medium">
            BUDGET
          </span>

          <span className="font-bold text-[#163b67]">
            {budget} €
          </span>

        </div>

        <input
          type="range"
          min="1000"
          max="50000"
          step="500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full accent-[#f5a623]"
        />

      </div>

      <button
        onClick={calculateSolar}
        className="w-full bg-[#f5a623] text-white py-4 rounded-2xl font-bold"
      >
        ⚡ Calculer
      </button>

    </aside>
  );
}