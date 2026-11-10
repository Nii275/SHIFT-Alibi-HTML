import importlib.util,unittest,pathlib,threading,urllib.request,json
ROOT=pathlib.Path(__file__).resolve().parents[1]
class ServerTests(unittest.TestCase):
 def test_server_available(self):self.assertTrue((ROOT/'scripts/server.py').exists(),'Local browser server is not implemented')
if (ROOT/'scripts/server.py').exists():
 spec=importlib.util.spec_from_file_location('shiftserver',ROOT/'scripts/server.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 class ProxyTests(unittest.TestCase):
  def setUp(self):
   self.calls=[]
   def remote(method,path,key,body):
    self.calls.append((method,path,key,body));return 200,{'data':[{'id':'deepseek-flash'}]} if path=='/models' else {'choices':[{'finish_reason':'stop','message':{'content':'{"delivery":"我会配合你的提问。"}'}}]}
   self.server=mod.create_server(ROOT/'web',port=0,remote=remote);self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start();self.base='http://127.0.0.1:'+str(self.server.server_port)
  def tearDown(self):self.server.shutdown();self.server.server_close();self.thread.join()
  def request(self,path,body=None,headers=None):
   req=urllib.request.Request(self.base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers or {})
   try:
    with urllib.request.urlopen(req) as r:return r.status,r.read(),r.headers
   except urllib.error.HTTPError as e:
    result=e.code,e.read(),e.headers;e.close();return result
  def auth(self):return {'Authorization':'Bearer test-not-a-real-key','X-Shift-Client':'1','Content-Type':'application/json','Origin':self.base}
  def test_root_assets_and_security_headers(self):
   code,body,headers=self.request('/');self.assertEqual(code,200);self.assertIn(b'SHIFT',body);self.assertEqual(headers['X-Content-Type-Options'],'nosniff');self.assertIn("object-src 'none'",headers['Content-Security-Policy'])
  def test_health_and_no_source_file_exposure(self):
   self.assertEqual(json.loads(self.request('/api/health')[1])['service'],'shift-alibi-web');self.assertEqual(self.request('/../scripts/server.py')[0],404)
  def test_hostile_origin_and_missing_key_rejected_before_network(self):
   h=self.auth();h['Origin']='https://hostile.example';self.assertEqual(self.request('/api/chat',{'context':'question'},h)[0],403);self.assertEqual(self.request('/api/chat',{'context':'question'},{'Content-Type':'application/json'})[0],403);self.assertEqual(self.calls,[])
  def test_model_request_and_fixed_official_payload(self):
   self.assertEqual(self.request('/api/models',headers=self.auth())[0],200);self.assertEqual(self.request('/api/chat',{'context':'角色片段','url':'https://hostile.example','model':'other'},self.auth())[0],200);self.assertEqual(self.calls[1][1],'/chat/completions');self.assertEqual(self.calls[1][3]['model'],'deepseek-flash');self.assertEqual(self.calls[1][3]['messages'][1]['content'],'角色片段');self.assertNotIn('test-not-a-real-key',json.dumps(self.calls[1][3]))
  def test_invalid_context_rejected(self):
   self.assertEqual(self.request('/api/chat',{'context':'x'*33000},self.auth())[0],413);self.assertEqual(self.request('/api/chat',{'context':{'x':1}},self.auth())[0],400);self.assertEqual(self.request('/api/chat',{'context':'\ud800'},self.auth())[0],400);self.assertEqual(self.calls,[])
if __name__=='__main__':unittest.main()
