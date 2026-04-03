import discord
import time
import asyncio
import logging
from discord.ext import commands
from discord import app_commands
from typing import Tuple

class AdminCommands(commands.Cog):
    def __init__(self, bot):
        print("Admin Commands cog cargado")
        self.bot = bot
        self.logger = logging.getLogger(__name__)

    async def validate_prefix(self, prefix: str) -> Tuple[bool, str]:
        """Validación robusta del prefijo"""
        # Limpiar espacios y verificar longitud
        cleaned_prefix = prefix.strip()
        if len(cleaned_prefix) < 1 or len(cleaned_prefix) > 5:
            return False, "El prefijo debe tener entre 1 y 5 caracteres (sin espacios en blanco)."
        
        # Caracteres prohibidos expandidos
        forbidden_chars = ['@', '#', ':', '`', '\\', '/', ' ', '\n', '\t', '\r', '"', "'"]
        forbidden_found = [char for char in forbidden_chars if char in prefix]
        if forbidden_found:
            return False, f"Caracteres no permitidos encontrados: `{'`, `'.join(forbidden_found)}`"
        
        # Prefijos reservados de Discord
        discord_reserved = ['/', '\\', '@everyone', '@here', '<@', '<#', '<:']
        if any(reserved in prefix.lower() for reserved in discord_reserved):
            return False, f"El prefijo `{prefix}` contiene elementos reservados por Discord."
        
        # Validar que no sea solo caracteres especiales
        if not any(c.isalnum() for c in prefix):
            return False, "El prefijo debe contener al menos un carácter alfanumérico."
        
        # Verificar que no empiece con espacios invisibles
        if prefix != cleaned_prefix:
            return False, "El prefijo no puede empezar o terminar con espacios."
        
        return True, "Válido"

    async def log_admin_action(self, interaction: discord.Interaction, action: str, details: str = ""):
        """Registrar acciones administrativas"""
        log_message = f"Guild: {interaction.guild.name} ({interaction.guild.id}) | User: {interaction.user} ({interaction.user.id}) | Action: {action}"
        if details:
            log_message += f" | Details: {details}"
        self.logger.info(log_message)

    @app_commands.command(name="prefix", description="Cambiar el prefijo del bot en este servidor")
    @app_commands.describe(nuevo_prefijo="Nuevo prefijo (1 a 5 caracteres)")
    @app_commands.default_permissions(administrator=True)
    @app_commands.guild_only()
    async def prefix_slash(self, interaction: discord.Interaction, nuevo_prefijo: str):
        # Validar prefijo
        is_valid, message = await self.validate_prefix(nuevo_prefijo)
        if not is_valid:
            await interaction.response.send_message(f"❌ {message}", ephemeral=True)
            return
        
        # Verificar si ya es el prefijo actual (evitar operación innecesaria)
        current_prefix = self.bot.prefixes.get(interaction.guild.id, '!')
        if current_prefix == nuevo_prefijo:
            await interaction.response.send_message(
                f"💡 El prefijo ya es `{nuevo_prefijo}`. No hay cambios necesarios.", 
                ephemeral=True
            )
            return
        
        try:
            await interaction.response.defer()
            
            # Actualizar en base de datos y caché
            await self.bot.db.set_guild_prefix(interaction.guild.id, nuevo_prefijo)
            self.bot.prefixes[interaction.guild.id] = nuevo_prefijo
            
            # Log de la acción
            await self.log_admin_action(
                interaction, 
                "PREFIX_CHANGE", 
                f"'{current_prefix}' -> '{nuevo_prefijo}'"
            )
            
            # Crear embed de confirmación
            embed = discord.Embed(
                title="✅ Prefijo Actualizado",
                description=f"Prefijo cambiado de `{current_prefix}` → `{nuevo_prefijo}`",
                color=0x00ff00,
                timestamp=discord.utils.utcnow()
            )
            embed.add_field(
                name="💡 Recordatorio",
                value="Los comandos slash (/) seguirán funcionando normalmente.",
                inline=False
            )
            embed.add_field(
                name="📝 Ejemplo de uso",
                value=f"Ahora puedes usar: `{nuevo_prefijo}help`, `{nuevo_prefijo}play`, etc.",
                inline=False
            )
            embed.set_footer(
                text=f"Cambiado por {interaction.user.display_name}",
                icon_url=interaction.user.display_avatar.url
            )
            
            await interaction.followup.send(embed=embed)
            
        except asyncio.TimeoutError:
            await interaction.followup.send(
                "❌ Timeout conectando con la base de datos. Intenta de nuevo.", 
                ephemeral=True
            )
        except discord.ConnectionClosed:
            await interaction.followup.send(
                "❌ Conexión perdida. El prefijo podría no haberse guardado.", 
                ephemeral=True
            )
        except Exception as e:
            self.logger.error(f"Error changing prefix in guild {interaction.guild.id}: {e}")
            await interaction.followup.send(
                "❌ Error interno del servidor. El equipo ha sido notificado.", 
                ephemeral=True
            )

    @app_commands.command(name="reset-prefix", description="Restaurar el prefijo por defecto (!)")
    @app_commands.default_permissions(administrator=True)
    @app_commands.guild_only()
    async def reset_prefix_slash(self, interaction: discord.Interaction):
        current_prefix = self.bot.prefixes.get(interaction.guild.id, '!')
        
        # Si ya es el prefijo por defecto
        if current_prefix == '!':
            await interaction.response.send_message(
                "💡 El prefijo ya es el por defecto (`!`). No hay cambios necesarios.", 
                ephemeral=True
            )
            return
        
        try:
            await interaction.response.defer()
            
            await self.bot.db.set_guild_prefix(interaction.guild.id, '!')
            self.bot.prefixes[interaction.guild.id] = '!'
            
            # Log de la acción
            await self.log_admin_action(
                interaction, 
                "PREFIX_RESET", 
                f"'{current_prefix}' -> '!'"
            )
            
            embed = discord.Embed(
                title="🔄 Prefijo Restaurado",
                description=f"El prefijo del servidor ha sido restaurado de `{current_prefix}` → `!`",
                color=0x3498db,
                timestamp=discord.utils.utcnow()
            )
            embed.add_field(
                name="📝 Comandos disponibles",
                value="Ahora puedes usar: `!help`, `!play`, `!stats`, etc.",
                inline=False
            )
            embed.set_footer(
                text=f"Restaurado por {interaction.user.display_name}",
                icon_url=interaction.user.display_avatar.url
            )
            
            await interaction.followup.send(embed=embed)
            
        except asyncio.TimeoutError:
            await interaction.followup.send(
                "❌ Timeout conectando con la base de datos. Intenta de nuevo.", 
                ephemeral=True
            )
        except Exception as e:
            self.logger.error(f"Error resetting prefix in guild {interaction.guild.id}: {e}")
            await interaction.followup.send(
                "❌ Error interno del servidor. El equipo ha sido notificado.", 
                ephemeral=True
            )

    @app_commands.command(name="prefix-info", description="Ver el prefijo actual del servidor")
    @app_commands.guild_only()
    async def prefix_info_slash(self, interaction: discord.Interaction):
        current_prefix = self.bot.prefixes.get(interaction.guild.id, '!')
        
        embed = discord.Embed(
            title="🔧 Información del Prefijo",
            description=f"El prefijo actual del servidor es: `{current_prefix}`",
            color=0x3498db,
            timestamp=discord.utils.utcnow()
        )
        
        embed.add_field(
            name="📝 Uso de comandos de texto",
            value=f"``````",
            inline=False
        )
        
        embed.add_field(
            name="⚡ Comandos slash",
            value="Los comandos slash siempre funcionan con `/`:\n`/play`, `/stats`, `/help`",
            inline=False
        )
        
        embed.add_field(
            name="👑 Para administradores",
            value=f"Cambiar prefijo: `/prefix`\nRestaurar: `/reset-prefix`",
            inline=False
        )
        
        embed.set_footer(
            text="Sokoromi - Bot de Sokoban Kawaii ✨",
            icon_url=self.bot.user.display_avatar.url
        )
        
        await interaction.response.send_message(embed=embed, ephemeral=True)

    @app_commands.command(name="server-info", description="Información detallada del servidor")
    @app_commands.default_permissions(administrator=True)
    @app_commands.guild_only()
    async def server_info_slash(self, interaction: discord.Interaction):
        try:
            guild = interaction.guild
            current_prefix = self.bot.prefixes.get(guild.id, '!')
            
            embed = discord.Embed(
                title=f"📊 Información de {guild.name}",
                color=0x5865F2,
                timestamp=discord.utils.utcnow()
            )
            
            embed.set_thumbnail(url=guild.icon.url if guild.icon else None)
            
            embed.add_field(
                name="🆔 ID del Servidor",
                value=f"`{guild.id}`",
                inline=True
            )
            
            embed.add_field(
                name="👑 Propietario",
                value=f"{guild.owner.mention}" if guild.owner else "Desconocido",
                inline=True
            )
            
            embed.add_field(
                name="📅 Creado",
                value=f"<t:{int(guild.created_at.timestamp())}:F>",
                inline=True
            )
            
            embed.add_field(
                name="👥 Miembros",
                value=f"`{guild.member_count}`",
                inline=True
            )
            
            embed.add_field(
                name="🔧 Prefijo Actual",
                value=f"`{current_prefix}`",
                inline=True
            )
            
            embed.add_field(
                name="📺 Canales",
                value=f"Texto: `{len(guild.text_channels)}`\nVoz: `{len(guild.voice_channels)}`",
                inline=True
            )
            
            embed.set_footer(
                text=f"Consultado por {interaction.user.display_name}",
                icon_url=interaction.user.display_avatar.url
            )
            
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        except Exception as e:
            self.logger.error(f"Error in server-info command: {e}")
            await interaction.response.send_message(
                "❌ Error obteniendo información del servidor.", 
                ephemeral=True
            )


async def setup(bot):
    await bot.add_cog(AdminCommands(bot))
