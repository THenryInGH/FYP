from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
# Downloads the model once and loads it onto CPU. No GPU required.

sentences = [
    "Allow h1 to talk to h2 with high priority.",
    "Throttle file transfers between h3 and h4."
]

embeddings = model.encode(sentences, convert_to_numpy=True)
# `encode` tokenizes + runs the transformer to produce one 768-dim vector per sentence.

print(embeddings.shape)   # → (2, 768) confirms two vectors, 768 dimensions each.
print(embeddings[0][:5])  # Just peek at the first five numbers to ensure it’s not all zeros.