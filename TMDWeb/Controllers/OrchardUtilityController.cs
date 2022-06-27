using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrchardCore;
using OrchardCore.ContentManagement;

namespace TMDWeb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrchardUtilityController : Controller
    {
        private IOrchardHelper _orchard;
        public OrchardUtilityController(IOrchardHelper orchard)
        {
            _orchard = orchard;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("get-contentitem-id")]
        public async Task<ContentItem> GetContentItemAsync(string contentItemId)
        {
            var item = await _orchard.GetContentItemByIdAsync(contentItemId);
            return item;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("get-contentitem-alias")]
        public async Task<ContentItem> GetContentItemByAliasAsync(string alias)
        {
            var item = await _orchard.GetContentItemByAliasAsync(alias);
            return item;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("get-contentitems-id")]
        public async Task<List<ContentItem>> GetContentItemsAsync(string contentItemId)
        {
            var items = await _orchard.QueryListItemsAsync(contentItemId, null);
            return items.ToList();
        }
    }
}
