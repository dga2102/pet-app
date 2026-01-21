import React from "react";
import { Combobox } from "@headlessui/react";
import { animals } from "@/data/animals";

// export default function AnimalSelect({ onChange }) { const [query, setQuery] = useState(""); const filtered = query === "" ? animals : animals.filter((animal) => animal.toLowerCase().includes(query.toLowerCase()) );

const Setup = () => {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <h1>Let's get started.</h1>
        <h2>
          Why not add an animal to your profile? From there we can start
          customising a care plan for them.
        </h2>
      </main>
    </div>
  );
};

export default Setup;
