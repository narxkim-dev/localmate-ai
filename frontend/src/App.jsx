import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import html2pdf from 'html2pdf.js'
import { marked } from 'marked'
import './App.css'

const STORAGE_KEY = 'localmate-conversation-id'

const INITIAL_MESSAGE = {
  id: 'initial-message',
  role: 'ai',
  markdown:
    '안녕하세요. 부산과 경주 여행을 안내하는 LocalMate AI입니다.\n\n' +
    '지역과 답변 언어를 선택한 뒤 여행에 관해 질문해 주세요.',
  isComplete: false,
  isError: false,
}

function getOrCreateConversationId() {
  const savedId = localStorage.getItem(STORAGE_KEY)

  if (savedId) {
    return savedId
  }

  const newId = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, newId)

  return newId
}

function renderMarkdown(markdown) {
  const normalizedMarkdown = markdown
    .replace(/\\([#*_])/g, '$1')
    .replace(
      /^[ \t]*(#{1,6})[ \t]*/gm,
      (_, hashes) => `${hashes} `,
    )

  const renderedHtml = marked.parse(normalizedMarkdown, {
    breaks: true,
    gfm: true,
  })

  return DOMPurify.sanitize(renderedHtml)
}

function extractCourseMarkdown(markdown) {
  const coursePattern =
    /<!--\s*COURSE_START\s*-->([\s\S]*?)<!--\s*COURSE_END\s*-->/i

  const match = markdown.match(coursePattern)

  return match?.[1]?.trim() ?? ''
}

function App() {
  const [conversationId, setConversationId] = useState(
    getOrCreateConversationId,
  )
  const [region, setRegion] = useState('BUSAN')
  const [language, setLanguage] = useState('KOREAN')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [isStreaming, setIsStreaming] = useState(false)

  const abortControllerRef = useRef(null)
  const chatHistoryRef = useRef(null)
  const messageInputRef = useRef(null)

  useEffect(() => {
    const chatHistory = chatHistoryRef.current

    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  function startNewChat() {
    abortControllerRef.current?.abort()

    const newConversationId = crypto.randomUUID()

    localStorage.setItem(STORAGE_KEY, newConversationId)

    setConversationId(newConversationId)
    setIsStreaming(false)
    setMessage('')
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'ai',
        markdown:
          '새로운 대화를 시작했습니다.\n\n' +
          '지역과 답변 언어를 선택한 뒤 질문해 주세요.',
        isComplete: false,
        isError: false,
      },
    ])

    requestAnimationFrame(() => {
      messageInputRef.current?.focus()
    })
  }

  function updateAiMessage(messageId, updates) {
    setMessages((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === messageId
          ? {
              ...currentMessage,
              ...updates,
            }
          : currentMessage,
      ),
    )
  }

  function appendAiMarkdown(messageId, markdownChunk) {
    setMessages((currentMessages) =>
      currentMessages.map((currentMessage) =>
        currentMessage.id === messageId
          ? {
              ...currentMessage,
              markdown:
                currentMessage.markdown + markdownChunk,
            }
          : currentMessage,
      ),
    )
  }

  function processSseBlock(block, aiMessageId) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.substring(5))
      .join('\n')

    if (!data || data === '[DONE]') {
      return
    }

    appendAiMarkdown(aiMessageId, data)
  }

  async function readEventStream(response, aiMessageId) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) {
        buffer += decoder.decode()

        if (buffer.trim()) {
          processSseBlock(buffer, aiMessageId)
        }

        break
      }

      buffer += decoder.decode(value, {
        stream: true,
      })

      const blocks = buffer.split(/\r?\n\r?\n/)
      buffer = blocks.pop() ?? ''

      blocks.forEach((block) => {
        processSseBlock(block, aiMessageId)
      })
    }
  }

  async function sendMessage() {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isStreaming) {
      return
    }

    const requestBody = {
      conversationId,
      region,
      language,
      message: trimmedMessage,
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmedMessage,
    }

    const aiMessageId = crypto.randomUUID()

    const aiMessage = {
      id: aiMessageId,
      role: 'ai',
      markdown: '',
      region,
      language,
      isComplete: false,
      isError: false,
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      aiMessage,
    ])

    setMessage('')
    setIsStreaming(true)

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetch(
        '/api/chats/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error(
          '스트리밍 응답을 읽을 수 없습니다.',
        )
      }

      await readEventStream(response, aiMessageId)

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) => {
          if (currentMessage.id !== aiMessageId) {
            return currentMessage
          }

          const hasAnswer =
            Boolean(currentMessage.markdown.trim())

          return {
            ...currentMessage,
            markdown:
              currentMessage.markdown.trim() ||
              '응답 내용이 없습니다.',
            isComplete: hasAnswer,
          }
        }),
      )
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(
          '채팅 요청 실패:',
          error,
        )

        updateAiMessage(aiMessageId, {
          markdown:
            '답변을 불러오지 못했습니다. ' +
            '잠시 후 다시 시도해 주세요.',
          isComplete: false,
          isError: true,
        })
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null

      requestAnimationFrame(() => {
        messageInputRef.current?.focus()
      })
    }
  }

  function handleKeyDown(event) {
    if (
      event.ctrlKey &&
      event.key === 'Enter'
    ) {
      event.preventDefault()
      sendMessage()
    }
  }

  function handleMessageChange(event) {
    setMessage(event.target.value)

    event.target.style.height = 'auto'
    event.target.style.height =
      `${Math.min(
        event.target.scrollHeight,
        150,
      )}px`
  }

  async function downloadAnswerAsPdf(aiMessage) {
    const courseMarkdown =
      extractCourseMarkdown(aiMessage.markdown)

    if (!courseMarkdown) {
      alert(
        '저장할 여행 코스를 찾을 수 없습니다.',
      )
      return
    }

    const regionNames = {
      BUSAN: '부산',
      GYEONGJU: '경주',
    }

    const languageNames = {
      KOREAN: '한국어',
      ENGLISH: 'English',
      JAPANESE: '日本語',
      CHINESE: '中文',
    }

    const createdAt =
      new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())

    const regionName =
      regionNames[aiMessage.region] ??
      aiMessage.region

    const languageName =
      languageNames[aiMessage.language] ??
      aiMessage.language

    const pdfDocument =
      document.createElement('div')

    pdfDocument.className = 'pdf-document'

    pdfDocument.innerHTML = `
      <h1 class="pdf-title">
        LocalMate AI 여행 코스
      </h1>

      <div class="pdf-meta">
        <p>지역: ${regionName}</p>
        <p>답변 언어: ${languageName}</p>
        <p>생성일: ${createdAt}</p>
      </div>

      <hr>

      <div class="pdf-content">
        ${renderMarkdown(courseMarkdown)}
      </div>
    `

    const pdfContainer =
      document.createElement('div')

    pdfContainer.className =
      'pdf-render-container'

    pdfContainer.appendChild(pdfDocument)
    document.body.appendChild(pdfContainer)

    const date = new Date()
      .toISOString()
      .slice(0, 10)

    const fileName =
      `localmate-course-` +
      `${aiMessage.region.toLowerCase()}-` +
      `${date}.pdf`

    const options = {
      margin: [12, 12, 12, 12],
      filename: fileName,

      image: {
        type: 'jpeg',
        quality: 0.98,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      },

      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },

      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: [
          '.pdf-content p',
          '.pdf-content li',
          '.pdf-content h1',
          '.pdf-content h2',
          '.pdf-content h3',
          '.pdf-content h4',
          'table',
          'thead',
          'tr',
          'blockquote',
          'pre',
        ],
      },
    }

    try {
      await document.fonts?.ready

      await html2pdf()
        .set(options)
        .from(pdfDocument)
        .save()
    } finally {
      pdfContainer.remove()
    }
  }

  return (
    <div className="chat-page">
      <main className="chat-app">
        <header className="chat-header">
          <div className="brand">
            <div className="brand-icon">
              LM
            </div>

            <div>
              <h1>LocalMate AI</h1>

              <p>
                Busan &amp; Gyeongju
                Travel Concierge
              </p>
            </div>
          </div>

          <button
            type="button"
            className="new-chat-button"
            onClick={startNewChat}
          >
            새 대화
          </button>
        </header>

        <section className="travel-settings">
          <label className="setting-field">
            <span>지역</span>

            <select
              value={region}
              disabled={isStreaming}
              onChange={(event) =>
                setRegion(event.target.value)
              }
            >
              <option value="BUSAN">
                부산
              </option>

              <option value="GYEONGJU">
                경주
              </option>
            </select>
          </label>

          <label className="setting-field">
            <span>답변 언어</span>

            <select
              value={language}
              disabled={isStreaming}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >
              <option value="KOREAN">
                한국어
              </option>

              <option value="ENGLISH">
                English
              </option>

              <option value="JAPANESE">
                日本語
              </option>

              <option value="CHINESE">
                中文
              </option>
            </select>
          </label>
        </section>

        <section
          ref={chatHistoryRef}
          className="chat-history"
          aria-live="polite"
        >
          {messages.map((chatMessage) => {
            const isUser =
              chatMessage.role === 'user'

            const courseMarkdown =
              isUser
                ? ''
                : extractCourseMarkdown(
                    chatMessage.markdown,
                  )

            const messageClassName =
              isUser
                ? 'message user-message'
                : 'message ai-message'

            const bubbleClassName = [
              'message-bubble',

              isStreaming &&
              chatMessage.id ===
                messages.at(-1)?.id
                ? 'streaming'
                : '',

              chatMessage.isError
                ? 'error-message'
                : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <article
                key={chatMessage.id}
                className={messageClassName}
              >
                <div className="message-profile">
                  {isUser ? 'ME' : 'AI'}
                </div>

                <div className="message-content">
                  <div className="message-name">
                    {isUser
                      ? 'You'
                      : 'LocalMate AI'}
                  </div>

                  {isUser ? (
                    <div className="message-bubble">
                      {chatMessage.text}
                    </div>
                  ) : (
                    <>
                      <div
                        className={bubbleClassName}
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(
                            chatMessage.markdown,
                          ),
                        }}
                      />

                      {chatMessage.isComplete &&
                        courseMarkdown && (
                          <div className="message-actions">
                            <button
                              type="button"
                              className="pdf-download-button"
                              onClick={() =>
                                downloadAnswerAsPdf(
                                  chatMessage,
                                )
                              }
                            >
                              <span
                                className="pdf-button-icon"
                                aria-hidden="true"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M7 3.75h7.25L18.5 8v12.25H7V3.75Z"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinejoin="round"
                                  />

                                  <path
                                    d="M14 3.75V8.5h4.5M12.75 11.25v5m0 0-2.25-2.25m2.25 2.25L15 14"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>

                              <span>여행 코스 PDF</span>
                            </button>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </section>

        <section className="chat-input-area">
          <label
            htmlFor="message"
            className="sr-only"
          >
            여행 질문
          </label>

          <textarea
            ref={messageInputRef}
            id="message"
            rows="1"
            maxLength="1000"
            value={message}
            disabled={isStreaming}
            placeholder="여행에 관해 질문해 주세요."
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            className="send-button"
            disabled={
              isStreaming ||
              !message.trim()
            }
            onClick={sendMessage}
          >
            {isStreaming
              ? '응답 중'
              : '전송'}
          </button>
        </section>

        <div className="input-guide">
          <span>Ctrl + Enter로 전송</span>

          <span>
            대화 ID:{' '}
            {conversationId.substring(0, 8)}
          </span>
        </div>
      </main>
    </div>
  )
}

export default App
