import React, { useEffect, useState, useCallback } from 'react'
import { getPieceInfo } from './data/api'
import { collect, connect, disconnect, getAccount } from './data/hen';
import ReactLoading from "react-loading";

const toTezValue = (price) => {
  return price / 1000000
}

const App = () => {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(false)
  const [error, setError] = useState(false)
  const [collectStr, setCollectStr] = useState('')


  useEffect(() => {
    (async () => {
      try {
        const activeAccount = await getAccount()
        if (activeAccount) {
          setAccount(activeAccount.address)
        }
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    })()
  }, [])


  const batchCollect = useCallback(async () => {
    setLoading(`Collecting`)
    try {
      const k = collectStr.split('\n')
      const toCollect = []
      let tez = 0
      for (const i in k) {
        let [objkt, editions] = k[i].split(' ')
        const piece = await getPieceInfo(objkt)
        console.log('ed', editions)
        if (piece) {
          if (!editions) {
            editions = 1
          }
          for (let i = 0; i < editions; i++) {
            tez += toTezValue(parseFloat(piece.price))
            toCollect.push(piece)
          }
        }
      }
      setLoading(`Collecting ${toCollect.length} for ${tez} tez`)
      await collect(toCollect)
      setLoading(false)
    } catch {
      setLoading(false)
      setError('collect failed')
    }
  }, [collectStr])

  const connectWallet = useCallback(() => {
    setLoading('Connecting')
    connect().then((account) => {
      setAccount(account)
    }).catch(() => {
      setError('Could not fetch wallet')
    }).finally(() => setLoading(false))
  }, [])


  const disconnectWallet = useCallback(() => {
    disconnect().then(() => {
      setAccount(false)
    }).catch(() => {
      setError('Could not disconnect wallet')
    })
  }, [])


  useEffect(() => {
    let errorTimer = setTimeout(() => setError(false), 5000);
    return () => {
      clearTimeout(errorTimer);
    };
  }, [error])


  return (
    <main className="min-h-screen flex flex-col">
      {loading ?
        <section id="loading" className="w-full flex-1 h-full flex flex-col items-center justify-center">
          <ReactLoading type='balls' color="#111827" />
          <p className="text-base text-left font-medium">{loading}</p>
        </section>
        : <>
          <section id="main" className="w-full flex flex-col items-center p-4 pb-16">
            <div className="container overflow-hidden">
              <h1 className="text-2xl font-bold mb-2">Batch Collect</h1>
              <textarea
                className="p-3 text-md bg-gray-100 border-gray-300 mt-2 w-full h-72"
                placeholder="List objkt ids, one per line, e.g:&#10;302412&#10;228477&#10;228411&#10;228411 5 - will collect 5 editions of this objkt"
                value={collectStr}
                onChange={(e) => setCollectStr(e.target.value)}
              />
            </div>
          </section>
          <section id="main" className="w-full flex flex-col items-center pb-16">
            <div className="container overflow-hidden">
              {account ? null : <div className="w-full py-12 flex flex-row justify-center">
                <button className="text-base bg-transparent text-gray-900 border-none underline" onClick={connectWallet}>Connect your wallet to start</button>
              </div>}
            </div>
          </section>
          <footer className="fixed bottom-0 bg-gray-900 w-full flex flex-row justify-center px-4">
            <div className="container flex flex-row justify-between py-3">
              <div className="flex-1 flex flex-row justify-start">
                {account
                  ? <button className="text-base bg-transparent text-white border-none underline" onClick={disconnectWallet}>Disconnect</button>
                  : <button className="text-base bg-transparent text-white border-none underline" onClick={connectWallet}>Connect</button>
                }
              </div>

              {error ? <div className="flex-1 flex flex-row justify-center">
                <p className="text-base text-red-500">
                  Error: {error}
                </p>
              </div> : null}

              <div className="flex-1 flex flex-row justify-end">
                {account
                  ? <button className="text-base bg-transparent text-white border-none underline" onClick={batchCollect}>Collect</button>
                  : null
                }
              </div>
            </div>
          </footer>
        </>
      }
    </main>
  );
}

export default App;
