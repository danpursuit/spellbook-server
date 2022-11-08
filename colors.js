// generate darkish colors for player names

const colors = ["#912f05",
    "#b50e2a",
    "#991a0f",
    "#aa0d27",
    "#0b015e",
    "#8dad0f",
    "#c90a60",
    "#0d8740",
    "#507f05",
    "#062f7c",
    "#061189",
    "#b804d8",
    "#3c7708",
    "#d3137c",
    "#960608",
    "#db8e08",
    "#c6099a",
    "#0b397f",
    "#000b59",
    "#407002",
    "#bf7001",
    "#049e28",
    "#03996e",
    "#088e76",
    "#08897c",
    "#af2000",
    "#db00a0",]

export const randomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
}