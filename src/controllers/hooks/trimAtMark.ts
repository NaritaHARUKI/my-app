const trimAtMark = (message: string): string => {
    const status = message.split('@')[0]
    return status
}

export default trimAtMark