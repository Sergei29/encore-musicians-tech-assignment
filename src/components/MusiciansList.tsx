"use client";

import type { MusicianProfile } from "@/types";

interface Props {
  list: MusicianProfile[];
}

function MusiciansList({ list }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((musician) => (
        <li
          key={musician.url}
          className="border border-gray-300 rounded-md p-2 overflow-hidden"
        >
          <img
            src={musician.photo}
            alt={`${musician.title} musician profile`}
            className="aspect-4/3 w-full object-cover"
            loading="lazy"
            width={400}
            height={300}
          />
          <h2 className="text-lg font-semibold">{musician.title}</h2>
          <p>{musician.description}</p>
          <p>
            Rating: {musician.rating} ({musician.numReviews} reviews)
          </p>
          <p>
            Price Range: ${musician.minPrice} - ${musician.maxPrice}
          </p>
          <p>Location: {musician.location}</p>
        </li>
      ))}
    </ul>
  );
}

export default MusiciansList;
