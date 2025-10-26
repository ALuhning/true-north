import { Dialog } from '@headlessui/react';

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md bg-white rounded-2xl p-8 shadow-2xl">
          <Dialog.Title className="text-2xl font-bold mb-4 text-center">
            How to Play
          </Dialog.Title>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍁</span>
              <div>
                <div className="font-semibold">Swipe Left or Click Canada</div>
                <div className="text-sm text-gray-600">If you think it's Canadian</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🦅</span>
              <div>
                <div className="font-semibold">Swipe Right or Click USA</div>
                <div className="text-sm text-gray-600">If you think it's American</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <div className="font-semibold">Answer Quickly</div>
                <div className="text-sm text-gray-600">You get bonus points for speed (up to +50)</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-semibold">Build Streaks</div>
                <div className="text-sm text-gray-600">+10 per correct in a row (max +50)</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold">20 Questions</div>
                <div className="text-sm text-gray-600">Each session has 20 rounds</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-canada-600 to-usa-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Let's Go! 🚀
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
