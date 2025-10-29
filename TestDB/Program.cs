using DataAccessObjects.DAO;
using System.ComponentModel;
using System.Threading.Tasks;

namespace TestDB
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var userList = await UserDAO.GetAllUsers();
            Console.WriteLine("List User:");
            foreach (var user in userList) {
                Console.WriteLine(user.ToString());
            }
        }
    }
}

