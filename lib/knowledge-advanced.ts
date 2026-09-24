// Phase 2: Advanced AI Knowledge Base with RAG-like capabilities
import { getKnowledge } from './knowledge'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('test-key') 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null

interface KnowledgeChunk {
  id: string
  content: string
  category: string
  embedding?: number[]
  metadata?: any
}

let knowledgeChunks: KnowledgeChunk[] = []
let embeddingsCache: Map<string, number[]> = new Map()

export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const kb = getKnowledge()
  const chunks: KnowledgeChunk[] = []

  chunks.push({
    id: 'business_overview',
    content: `${kb.business.name} - ${kb.business.tagline}. ${kb.business.description} Hours: ${kb.business.hours}. Delivery: ${kb.business.deliveryTime}, Fee: ${kb.business.deliveryFee}. Areas: ${kb.business.areas?.join(', ')}`,
    category: 'business'
  })

  kb.packages.forEach((pkg: any) => {
    chunks.push({
      id: `package_${pkg.id}`,
      content: `Package: ${pkg.name} - Price: ${pkg.price} (was ${pkg.originalPrice}), Duration: ${pkg.duration}, Best for: ${pkg.bestFor}, Includes: ${pkg.includes.join(', ')}`,
      category: 'package',
      metadata: pkg
    })
  })

  kb.flavors.forEach((flavor: any) => {
    chunks.push({
      id: `flavor_${flavor.name.toLowerCase().replace(/\s+/g, '_')}`,
      content: `Flavor: ${flavor.name}, Category: ${flavor.category}, Popular: ${flavor.popular ? 'Yes' : 'No'}`,
      category: 'flavor',
      metadata: flavor
    })
  })

  kb.faqs.forEach((faq: any, idx: number) => {
    chunks.push({
      id: `faq_${idx}`,
      content: `Q: ${faq.question} A: ${faq.answer}`,
      category: 'faq',
      metadata: faq
    })
  })

  Object.entries(kb.policies).forEach(([key, value]) => {
    chunks.push({
      id: `policy_${key}`,
      content: `Policy - ${key}: ${value}`,
      category: 'policy'
    })
  })

  kb.services.forEach((service: any) => {
    chunks.push({
      id: `service_${service.id}`,
      content: `Service: ${service.name} - ${service.description}`,
      category: 'service',
      metadata: service
    })
  })

  knowledgeChunks = chunks
  return chunks
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!openai) return null
  
  try {
    const cacheKey = text.substring(0, 100)
    if (embeddingsCache.has(cacheKey)) {
      return embeddingsCache.get(cacheKey)!
    }

    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text,
    })

    const embedding = response.data[0].embedding
    embeddingsCache.set(cacheKey, embedding)
    return embedding
  } catch (e) {
    console.error('Embedding generation failed:', e)
    return null
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function searchKnowledge(query: string, topK: number = 5): Promise<KnowledgeChunk[]> {
  if (knowledgeChunks.length === 0) {
    buildKnowledgeChunks()
  }

  if (!openai) {
    return keywordSearch(query, topK)
  }

  try {
    const queryEmbedding = await generateEmbedding(query)
    if (!queryEmbedding) {
      return keywordSearch(query, topK)
    }

    const scoredChunks = await Promise.all(
      knowledgeChunks.map(async (chunk) => {
        let embedding = chunk.embedding
        if (!embedding) {
          embedding = (await generateEmbedding(chunk.content)) || undefined
          chunk.embedding = embedding
        }
        const score = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0
        return { chunk, score }
      })
    )

    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => s.chunk)
  } catch (e) {
    console.error('Semantic search failed, falling back to keyword:', e)
    return keywordSearch(query, topK)
  }
}

function keywordSearch(query: string, topK: number): KnowledgeChunk[] {
  const lowerQuery = query.toLowerCase()
  const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 2)

  const scored = knowledgeChunks.map(chunk => {
    const content = chunk.content.toLowerCase()
    let score = 0
    keywords.forEach(kw => {
      if (content.includes(kw)) score += 1
      if (chunk.category.toLowerCase().includes(kw)) score += 2
    })
    if (content.includes(lowerQuery)) score += 3
    return { chunk, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk)
}

export function getKnowledgeChunks() {
  if (knowledgeChunks.length === 0) {
    buildKnowledgeChunks()
  }
  return knowledgeChunks
}

export async function getEnhancedSystemPrompt(userQuery?: string) {
  const { getSystemPrompt } = await import('./knowledge')
  const basePrompt = getSystemPrompt()

  if (!userQuery) {
    return basePrompt
  }

  const relevantChunks = await searchKnowledge(userQuery, 5)
  const ragContext = relevantChunks.map(c => `[${c.category}] ${c.content}`).join('\n')

  return `${basePrompt}

RELEVANT KNOWLEDGE FOR CURRENT QUERY (Use this to answer accurately):
${ragContext}

Remember: Use the relevant knowledge above to answer, but don't hallucinate beyond it. If query is about something not in knowledge, say you'll check with team.
`
}
