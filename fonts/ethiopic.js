import localFont from "@next/font/local";

export const ethiopic = localFont({
	src: [
		{
			path: "../public/fonts/Noto_Serif_Ethiopic/NotoSerifEthiopic.ttf",
			weight: "400",
		},
	],
	variable: "--font-ethiopic",
});