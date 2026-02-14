import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-heading-1",
        "text-heading-2",
        "text-heading-3",
        "text-body",
        "text-caption",
        "text-overline",
      ],
    },
  },
});

export function cn(...inputs: Parameters<typeof twMerge>) {
  return twMerge(...inputs);
}
