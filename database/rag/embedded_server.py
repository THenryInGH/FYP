from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

def embed_text(text: str) -> list[float]:
    return model.encode(text, convert_to_numpy=True).tolist()

