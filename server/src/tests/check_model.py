import pickle
import os

print('model.pkl exists:', os.path.exists('model.pkl'))
print('model.pkl size:', os.path.getsize('model.pkl')
      if os.path.exists('model.pkl') else 0)

if os.path.exists('model.pkl'):
    try:
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
        print('Model type:', type(model))
        print('Model attributes:', dir(model)[:10])
        if hasattr(model, 'predict'):
            print('Model has predict method')
        if hasattr(model, '__call__'):
            print('Model is callable')
    except Exception as e:
        print('Error loading model:', e)
