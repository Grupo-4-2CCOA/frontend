import time
import threading
import statistics
from datetime import datetime
from collections import defaultdict
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import json

# Configurações do teste
BASE_URL = "http://localhost:5173"  # URL do frontend (Vite dev server)
API_URL = "http://localhost:8080"   # URL do backend
NUM_USERS = 5                        # Número de usuários simultâneos
TEST_DURATION = 60                   # Duração do teste em segundos
THINK_TIME = 2                       # Tempo de espera entre ações (em segundos)
HEADLESS = False                     # True para executar sem abrir navegador

# Estatísticas globais
stats = {
    'total_requests': 0,
    'successful_requests': 0,
    'failed_requests': 0,
    'response_times': [],
    'errors': defaultdict(int),
    'page_load_times': [],
    'start_time': None,
    'end_time': None
}

stats_lock = threading.Lock()


class UserSimulator:
    """Simula um usuário navegando no site"""
    
    def __init__(self, user_id, base_url):
        self.user_id = user_id
        self.base_url = base_url
        self.driver = None
        self.response_times = []
        self.errors = []
        
    def setup_driver(self):
        """Configura o driver do Selenium"""
        try:
            chrome_options = Options()
            if HEADLESS:
                chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument(f'--user-agent=Mozilla/5.0 (Teste Carga User {self.user_id})')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            return True
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro ao configurar driver: {e}")
            return False
    
    def measure_time(self, func, *args, **kwargs):
        """Mede o tempo de execução de uma função"""
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start_time
            with stats_lock:
                stats['total_requests'] += 1
                stats['successful_requests'] += 1
                stats['response_times'].append(elapsed)
                self.response_times.append(elapsed)
            return result
        except Exception as e:
            elapsed = time.time() - start_time
            with stats_lock:
                stats['total_requests'] += 1
                stats['failed_requests'] += 1
                stats['errors'][str(e)] += 1
                self.errors.append(str(e))
            raise
    
    def wait_for_element(self, by, value, timeout=10):
        """Aguarda elemento aparecer na página"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False
    
    def test_homepage(self):
        """Testa carregamento da página inicial"""
        print(f"👤 Usuário {self.user_id}: Acessando página inicial...")
        start_time = time.time()
        
        try:
            self.driver.get(self.base_url)
            
            # Aguarda elementos principais carregarem
            if self.wait_for_element(By.TAG_NAME, "body"):
                load_time = time.time() - start_time
                with stats_lock:
                    stats['page_load_times'].append(load_time)
                print(f"✅ Usuário {self.user_id}: Página inicial carregada em {load_time:.2f}s")
                return True
            else:
                raise Exception("Timeout ao carregar página inicial")
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro ao carregar página inicial: {e}")
            raise
    
    def test_navigation(self):
        """Testa navegação entre páginas"""
        print(f"👤 Usuário {self.user_id}: Testando navegação...")
        
        try:
            # Testa links de navegação
            nav_links = [
                (By.LINK_TEXT, "Serviços"),
                (By.LINK_TEXT, "Contato"),
                (By.LINK_TEXT, "Home"),
            ]
            
            for by, text in nav_links:
                try:
                    element = self.driver.find_element(by, text)
                    element.click()
                    time.sleep(THINK_TIME)
                    print(f"✅ Usuário {self.user_id}: Navegou para {text}")
                except NoSuchElementException:
                    print(f"⚠️ Usuário {self.user_id}: Link '{text}' não encontrado")
                    
            return True
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro na navegação: {e}")
            raise
    
    def test_services_section(self):
        """Testa visualização da seção de serviços"""
        print(f"👤 Usuário {self.user_id}: Visualizando serviços...")
        
        try:
            # Rola até a seção de serviços
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 2);")
            time.sleep(THINK_TIME)
            
            # Aguarda carrossel de serviços
            if self.wait_for_element(By.CLASS_NAME, "swiper", timeout=5):
                print(f"✅ Usuário {self.user_id}: Seção de serviços carregada")
                return True
            else:
                print(f"⚠️ Usuário {self.user_id}: Seção de serviços não encontrada")
                return True  # Não é crítico
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro ao visualizar serviços: {e}")
            return False
    
    def test_contact_section(self):
        """Testa visualização da seção de contato"""
        print(f"👤 Usuário {self.user_id}: Visualizando seção de contato...")
        
        try:
            # Navega para contato
            try:
                contact_link = self.driver.find_element(By.LINK_TEXT, "Contato")
                contact_link.click()
                time.sleep(THINK_TIME)
            except NoSuchElementException:
                # Tenta rolar até o fim da página
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(THINK_TIME)
            
            print(f"✅ Usuário {self.user_id}: Seção de contato visualizada")
            return True
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro ao visualizar contato: {e}")
            return False
    
    def test_responsive_design(self):
        """Testa responsividade mudando tamanho da janela"""
        print(f"👤 Usuário {self.user_id}: Testando responsividade...")
        
        try:
            sizes = [(1920, 1080), (768, 1024), (375, 667)]
            
            for width, height in sizes:
                self.driver.set_window_size(width, height)
                time.sleep(1)
                screenshot_name = f"screenshot_user_{self.user_id}_{width}x{height}.png"
                try:
                    self.driver.save_screenshot(screenshot_name)
                except:
                    pass  # Ignora erros de screenshot
            
            # Restaura tamanho original
            self.driver.set_window_size(1920, 1080)
            print(f"✅ Usuário {self.user_id}: Teste de responsividade concluído")
            return True
        except Exception as e:
            print(f"❌ Usuário {self.user_id}: Erro no teste de responsividade: {e}")
            return False
    
    def run_session(self, duration):
        """Executa uma sessão completa de teste"""
        end_time = time.time() + duration
        actions = [
            self.test_homepage,
            self.test_navigation,
            self.test_services_section,
            self.test_contact_section,
            self.test_responsive_design,
        ]
        
        cycle = 0
        while time.time() < end_time:
            cycle += 1
            print(f"\n🔄 Usuário {self.user_id}: Ciclo {cycle}")
            
            for action in actions:
                if time.time() >= end_time:
                    break
                    
                try:
                    self.measure_time(action)
                    time.sleep(THINK_TIME)
                except Exception as e:
                    print(f"⚠️ Usuário {self.user_id}: Erro na ação: {e}")
                    time.sleep(THINK_TIME)
            
            # Pequena pausa entre ciclos
            if time.time() < end_time:
                time.sleep(THINK_TIME * 2)
    
    def cleanup(self):
        """Limpa recursos"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass


def run_user(user_id, base_url, duration):
    """Função executada por cada thread de usuário"""
    user = UserSimulator(user_id, base_url)
    
    try:
        if not user.setup_driver():
            return
        
        print(f"🚀 Usuário {user_id}: Iniciando sessão...")
        user.run_session(duration)
        print(f"✅ Usuário {user_id}: Sessão concluída")
        
    except Exception as e:
        print(f"❌ Usuário {user_id}: Erro fatal: {e}")
    finally:
        user.cleanup()


def print_statistics():
    """Imprime estatísticas do teste"""
    print("\n" + "="*80)
    print("📊 ESTATÍSTICAS DO TESTE DE CARGA")
    print("="*80)
    
    with stats_lock:
        total = stats['total_requests']
        successful = stats['successful_requests']
        failed = stats['failed_requests']
        success_rate = (successful / total * 100) if total > 0 else 0
        
        print(f"\n📈 Requisições:")
        print(f"   Total: {total}")
        print(f"   Sucesso: {successful} ({success_rate:.2f}%)")
        print(f"   Falhas: {failed} ({100-success_rate:.2f}%)")
        
        if stats['response_times']:
            times = stats['response_times']
            print(f"\n⏱️  Tempos de Resposta (segundos):")
            print(f"   Mínimo: {min(times):.3f}s")
            print(f"   Máximo: {max(times):.3f}s")
            print(f"   Média: {statistics.mean(times):.3f}s")
            print(f"   Mediana: {statistics.median(times):.3f}s")
            if len(times) > 1:
                print(f"   Desvio Padrão: {statistics.stdev(times):.3f}s")
            
            # Percentis
            sorted_times = sorted(times)
            percentiles = [50, 75, 90, 95, 99]
            print(f"\n📊 Percentis de Tempo de Resposta:")
            for p in percentiles:
                idx = int(len(sorted_times) * p / 100)
                idx = min(idx, len(sorted_times) - 1)
                print(f"   P{p}: {sorted_times[idx]:.3f}s")
        
        if stats['page_load_times']:
            load_times = stats['page_load_times']
            print(f"\n🌐 Tempos de Carregamento de Páginas:")
            print(f"   Média: {statistics.mean(load_times):.3f}s")
            print(f"   Mínimo: {min(load_times):.3f}s")
            print(f"   Máximo: {max(load_times):.3f}s")
        
        if stats['errors']:
            print(f"\n❌ Erros Encontrados:")
            for error, count in stats['errors'].items():
                print(f"   {error[:80]}: {count}x")
        
        duration = stats['end_time'] - stats['start_time']
        print(f"\n⏰ Duração Total: {duration:.2f}s")
        print(f"📊 Requisições/segundo: {total/duration:.2f}" if duration > 0 else "")
        
    print("\n" + "="*80)


def save_report():
    """Salva relatório em arquivo JSON"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'configuration': {
            'base_url': BASE_URL,
            'num_users': NUM_USERS,
            'test_duration': TEST_DURATION,
            'think_time': THINK_TIME
        },
        'statistics': {
            'total_requests': stats['total_requests'],
            'successful_requests': stats['successful_requests'],
            'failed_requests': stats['failed_requests'],
            'success_rate': (stats['successful_requests'] / stats['total_requests'] * 100) if stats['total_requests'] > 0 else 0,
            'response_times': {
                'mean': statistics.mean(stats['response_times']) if stats['response_times'] else 0,
                'median': statistics.median(stats['response_times']) if stats['response_times'] else 0,
                'min': min(stats['response_times']) if stats['response_times'] else 0,
                'max': max(stats['response_times']) if stats['response_times'] else 0,
                'p95': sorted(stats['response_times'])[int(len(stats['response_times']) * 0.95)] if stats['response_times'] else 0,
            },
            'page_load_times': {
                'mean': statistics.mean(stats['page_load_times']) if stats['page_load_times'] else 0,
                'min': min(stats['page_load_times']) if stats['page_load_times'] else 0,
                'max': max(stats['page_load_times']) if stats['page_load_times'] else 0,
            },
            'errors': dict(stats['errors']),
            'duration': stats['end_time'] - stats['start_time'] if stats['end_time'] else 0
        }
    }
    
    filename = f"load_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Relatório salvo em: {filename}")


def main():
    """Função principal"""
    print("="*80)
    print("🧪 TESTE DE CARGA - BEAUTY BARRETO")
    print("="*80)
    print(f"\n⚙️  Configurações:")
    print(f"   URL Base: {BASE_URL}")
    print(f"   Usuários Simultâneos: {NUM_USERS}")
    print(f"   Duração: {TEST_DURATION}s")
    print(f"   Think Time: {THINK_TIME}s")
    print(f"   Headless: {HEADLESS}")
    print("\n🚀 Iniciando teste...\n")
    
    stats['start_time'] = time.time()
    
    # Cria threads para cada usuário
    threads = []
    for i in range(NUM_USERS):
        thread = threading.Thread(
            target=run_user,
            args=(i+1, BASE_URL, TEST_DURATION),
            daemon=True
        )
        threads.append(thread)
        thread.start()
        time.sleep(0.5)  # Pequeno delay entre início de cada usuário
    
    # Aguarda todas as threads terminarem
    for thread in threads:
        thread.join(timeout=TEST_DURATION + 30)
    
    stats['end_time'] = time.time()
    
    # Imprime estatísticas
    print_statistics()
    
    # Salva relatório
    save_report()
    
    print("\n✅ Teste concluído!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário")
        stats['end_time'] = time.time()
        print_statistics()
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        import traceback
        traceback.print_exc()

