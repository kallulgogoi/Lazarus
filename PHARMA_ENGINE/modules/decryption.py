def caesar_decrypt(word):
    results = []

    for shift in range(26):
        decrypted = ""
        for ch in word:
            if ch.isalpha():
                decrypted += chr((ord(ch) - ord('A') - shift) % 26 + ord('A'))
        results.append(decrypted)

    return results


def get_valid_drug(word, db):
    candidates = caesar_decrypt(word)

    for w in candidates:
        if db.drug_exists(w):
            return w

    return None