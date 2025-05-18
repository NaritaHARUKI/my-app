const getEditingId = (message: string): number => {
    const id = message.split('@')[1]
    return Number(id)
}

export default getEditingId